import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, RefreshToken, PasswordResetToken } from '../models/index.js';
import { db } from '../db/mongoose.js';
import { env } from '../config/env.js';
import { hashToken, randomToken, signAccess } from '../utils/auth.js';
import { auth } from '../middleware/core.js';

const router = Router();

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password is too long'),
  displayName: z.string().min(1).max(80).optional(),
});

async function generateTokens(user) {
  const access = signAccess({ sub: String(user._id), role: user.role });
  const rawRefreshToken = randomToken();
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000),
  });
  return { accessToken: access, refreshToken: rawRefreshToken };
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    await db();
    const data = registerSchema.parse(req.body);

    const exists = await User.findOne({
      $or: [
        { email: data.email.toLowerCase() },
        { username: data.username.toLowerCase() },
      ],
    });

    if (exists) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      username: data.username,
      email: data.email,
      passwordHash,
      displayName: data.displayName || data.username,
    });

    const tokenData = await generateTokens(user);
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
      },
      ...tokenData,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    await db();
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string(),
    }).parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password. Please create an account first if you do not have one.' });
    }

    const tokenData = await generateTokens(user);
    res.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
      ...tokenData,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    await db();
    const { refreshToken } = z.object({
      refreshToken: z.string().min(20),
    }).parse(req.body);

    const tokenDoc = await RefreshToken.findOne({
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
    }).populate('userId');

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();

    const user = tokenDoc.userId;
    const tokenData = await generateTokens(user);
    res.json(tokenData);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', auth(false), async (req, res, next) => {
  try {
    await db();
    let userId = req.user?.sub;
    if (!userId) {
      // No token — return null so the frontend uses its stored localStorage data
      return res.json({ user: null });
    }
    const user = await User.findById(userId).select('-passwordHash').lean();
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/me - Update user profile
const handleUpdateProfile = async (req, res, next) => {
  try {
    await db();
    const { displayName, username, bio, avatarUrl, location, website, favoriteGenres } = req.body;
    const update = {};
    if (displayName !== undefined) update.displayName = displayName.trim();
    if (username !== undefined) update.username = username.trim().toLowerCase();
    if (bio !== undefined) update.bio = bio.trim();
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl.trim();
    if (location !== undefined) update.location = location.trim();
    if (website !== undefined) update.website = website.trim();
    if (Array.isArray(favoriteGenres)) update.favoriteGenres = favoriteGenres;

    let userId = req.user?.sub;
    if (!userId) {
      // No authenticated user
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    ).select('-passwordHash').lean();

    res.json({ ok: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
};

router.patch('/me', auth(false), handleUpdateProfile);
router.put('/me', auth(false), handleUpdateProfile);

// POST /api/auth/forgot-password - Request password reset token
router.post('/forgot-password', async (req, res, next) => {
  try {
    await db();
    const { email } = z.object({
      email: z.string().email('Please enter a valid email address'),
    }).parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email address.' });
    }

    // Generate a 6-digit reset code
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt,
    });

    res.json({
      ok: true,
      message: 'Password reset code generated.',
      resetToken: token,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password - Reset password using token
router.post('/reset-password', async (req, res, next) => {
  try {
    await db();
    const { email, token, newPassword } = z.object({
      email: z.string().email('Please enter a valid email address'),
      token: z.string().min(1, 'Reset code is required'),
      newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    }).parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const tokenDoc = await PasswordResetToken.findOne({
      userId: user._id,
      token: token.trim(),
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired password reset code.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    await user.save();

    await PasswordResetToken.deleteMany({ userId: user._id });

    res.json({ ok: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    next(err);
  }
});

export default router;
