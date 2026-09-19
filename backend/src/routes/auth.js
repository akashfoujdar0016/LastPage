import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, RefreshToken } from '../models/index.js';
import { db } from '../db/mongoose.js';
import { env } from '../config/env.js';
import { hashToken, randomToken, signAccess } from '../utils/auth.js';
import { auth } from '../middleware/core.js';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
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
      return res.status(401).json({ error: 'Invalid credentials' });
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
router.get('/me', auth(), async (req, res, next) => {
  try {
    await db();
    const user = await User.findById(req.user?.sub).select('-passwordHash').lean();
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
