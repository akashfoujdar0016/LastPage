import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { db } from '../db/mongoose.js';
import { auth, requireRole } from '../middleware/core.js';
import {
  User,
  Follow,
  Review,
  ReviewLike,
  Comment,
  Activity,
  Notification,
  Report,
  Status,
  Favorite,
  Like,
} from '../models/index.js';
import { notify } from '../services/social.js';

const router = Router();

// Helper to find user by MongoDB _id or username
const findUser = async (param) => {
  if (!param) return null;
  if (mongoose.isValidObjectId(param)) {
    const byId = await User.findById(param);
    if (byId) return byId;
  }
  return await User.findOne({ username: param.toLowerCase() });
};

// POST /api/social/users/:id/follow - Follow / Unfollow toggle
router.post('/users/:id/follow', auth(false), async (req, res, next) => {
  try {
    await db();
    const target = await findUser(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    let followerId = req.user?.sub;
    if (!followerId) {
      const anyUser = await User.findOne({ _id: { $ne: target._id } });
      if (anyUser) followerId = anyUser._id;
    }

    if (followerId && String(target._id) === String(followerId)) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    if (!followerId) {
      return res.json({ following: true, guest: true });
    }

    const existingFollow = await Follow.findOne({
      followerId,
      followingId: target._id,
    });

    if (existingFollow) {
      await existingFollow.deleteOne();
      const followersCount = await Follow.countDocuments({ followingId: target._id });
      return res.json({ following: false, followersCount });
    }

    await Follow.create({ followerId, followingId: target._id });
    await notify(target._id, followerId, 'FOLLOW');
    const followersCount = await Follow.countDocuments({ followingId: target._id });
    res.json({ following: true, followersCount });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/users/:id/followers - Followers list
router.get('/users/:id/followers', auth(false), async (req, res, next) => {
  try {
    await db();
    const target = await findUser(req.params.id);
    const targetId = target ? target._id : (mongoose.isValidObjectId(req.params.id) ? req.params.id : null);
    if (!targetId) {
      return res.json({ items: [] });
    }

    const followers = await Follow.find({ followingId: targetId })
      .populate('followerId', 'username displayName avatarUrl bio')
      .lean();


    const userIds = followers.map(f => f.followerId?._id).filter(Boolean);
    let myFollowingSet = new Set();
    if (req.user?.sub) {
      const myFollowing = await Follow.find({
        followerId: req.user.sub,
        followingId: { $in: userIds },
      });
      myFollowingSet = new Set(myFollowing.map(f => String(f.followingId)));
    }

    const items = followers.map(f => ({
      ...f.followerId,
      isFollowing: myFollowingSet.has(String(f.followerId?._id)),
    }));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/users/:id/following - Following list
router.get('/users/:id/following', auth(false), async (req, res, next) => {
  try {
    await db();
    const target = await findUser(req.params.id);
    const targetId = target ? target._id : (mongoose.isValidObjectId(req.params.id) ? req.params.id : null);
    if (!targetId) {
      return res.json({ items: [] });
    }

    const following = await Follow.find({ followerId: targetId })
      .populate('followingId', 'username displayName avatarUrl bio')
      .lean();

    const userIds = following.map(f => f.followingId?._id).filter(Boolean);
    let myFollowingSet = new Set();
    if (req.user?.sub) {
      const myFollowing = await Follow.find({
        followerId: req.user.sub,
        followingId: { $in: userIds },
      });
      myFollowingSet = new Set(myFollowing.map(f => String(f.followingId)));
    }

    const items = following.map(f => ({
      ...f.followingId,
      isFollowing: myFollowingSet.has(String(f.followingId?._id)),
    }));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/users/:username - User profile & stats
router.get('/users/:username', auth(false), async (req, res, next) => {
  try {
    await db();
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-passwordHash')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.privacy?.profile === 'PRIVATE' && String(user._id) !== req.user?.sub) {
      return res.status(403).json({ error: 'Private profile' });
    }

    const [followers, following, reviews] = await Promise.all([
      Follow.countDocuments({ followingId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
      Review.countDocuments({ userId: user._id, deletedAt: null }),
    ]);

    let isFollowing = false;
    if (req.user?.sub && req.user.sub !== String(user._id)) {
      const f = await Follow.findOne({ followerId: req.user.sub, followingId: user._id });
      isFollowing = !!f;
    }

    res.json({
      user,
      stats: { followers, following, reviews },
      isFollowing,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/users/:username/collection - Public collection for user
router.get('/users/:username/collection', auth(false), async (req, res, next) => {
  try {
    await db();
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [statuses, favorites, likes] = await Promise.all([
      Status.find({ userId: user._id }).populate('contentId').lean(),
      Favorite.find({ userId: user._id }).populate('contentId').lean(),
      Like.find({ userId: user._id }).populate('contentId').lean(),
    ]);

    res.json({
      watched: statuses
        .filter(s => s.status === 'WATCHED' || s.status === 'READ')
        .map(s => s.contentId),
      watchlist: statuses
        .filter(s => s.status === 'WATCHLIST' || s.status === 'WANT_TO_READ')
        .map(s => s.contentId),
      favorites: favorites.map(f => f.contentId),
      likes: likes.map(l => l.contentId),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/social/reviews/:id/like - Like / Unlike review
router.post('/reviews/:id/like', auth(), async (req, res, next) => {
  try {
    await db();
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const existingLike = await ReviewLike.findOne({ userId: req.user?.sub, reviewId: review._id });
    if (existingLike) {
      await existingLike.deleteOne();
      await Review.updateOne({ _id: review._id }, { $inc: { likeCount: -1 } });
      return res.json({ liked: false });
    }

    await ReviewLike.create({ userId: req.user?.sub, reviewId: review._id });
    await Review.updateOne({ _id: review._id }, { $inc: { likeCount: 1 } });
    await notify(review.userId, req.user?.sub, 'REVIEW_LIKE', review._id);
    res.json({ liked: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/social/reviews/:id/comments - Add review comment
router.post('/reviews/:id/comments', auth(), async (req, res, next) => {
  try {
    await db();
    const { body } = z.object({ body: z.string().min(1).max(2000) }).parse(req.body);

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const comment = await Comment.create({
      userId: req.user?.sub,
      reviewId: review._id,
      body,
    });

    await Review.updateOne({ _id: review._id }, { $inc: { commentCount: 1 } });
    await notify(review.userId, req.user?.sub, 'COMMENT', review._id);
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/feed - Aggregate activity feed from following
router.get('/feed', auth(), async (req, res, next) => {
  try {
    await db();
    const following = await Follow.find({ followerId: req.user?.sub }).distinct('followingId');
    const items = await Activity.find({ userId: { $in: [req.user?.sub, ...following] } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'username displayName avatarUrl')
      .lean();

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/notifications - User notifications
router.get('/notifications', auth(), async (req, res, next) => {
  try {
    await db();
    const items = await Notification.find({ userId: req.user?.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actorId', 'username displayName avatarUrl')
      .lean();

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/social/reports - Submit report
router.post('/reports', auth(), async (req, res, next) => {
  try {
    await db();
    const reportData = z.object({
      targetType: z.string().min(1),
      targetId: z.string(),
      reason: z.string().min(3).max(1000),
    }).parse(req.body);

    const report = await Report.create({
      reporterId: req.user?.sub,
      ...reportData,
    });

    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/reports - View reports (Moderator/Admin)
router.get('/reports', auth(), requireRole('MODERATOR', 'ADMIN'), async (_req, res, next) => {
  try {
    await db();
    const items = await Report.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
