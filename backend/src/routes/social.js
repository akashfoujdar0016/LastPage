import {Router} from 'express';
import {z} from 'zod';
import {db} from '../db/mongoose.js';
import {auth, requireRole} from '../middleware/core.js';
import {User, Follow, Review, ReviewLike, Comment, Activity, Notification, Report, Status, Favorite, Like} from '../models/index.js';
import {notify} from '../services/social.js';

const r = Router();

// Follow / Unfollow toggle
r.post('/users/:id/follow', auth(), async (req, res, next) => {
  try {
    await db();
    if (req.params.id === req.user?.sub) return res.status(400).json({ error: 'Cannot follow yourself' });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    const f = await Follow.findOne({ followerId: req.user?.sub, followingId: target._id });
    if (f) {
      await f.deleteOne();
      return res.json({ following: false });
    }
    await Follow.create({ followerId: req.user?.sub, followingId: target._id });
    await notify(target._id, req.user?.sub, 'FOLLOW');
    res.json({ following: true });
  } catch (e) {
    next(e);
  }
});

// Followers list
r.get('/users/:id/followers', auth(false), async (req, res, next) => {
  try {
    await db();
    const followers = await Follow.find({ followingId: req.params.id })
      .populate('followerId', 'username displayName avatarUrl bio')
      .lean();
    const userIds = followers.map(f => f.followerId?._id).filter(Boolean);
    let myFollowingSet = new Set();
    if (req.user?.sub) {
      const myFollowing = await Follow.find({ followerId: req.user.sub, followingId: { $in: userIds } });
      myFollowingSet = new Set(myFollowing.map(f => String(f.followingId)));
    }
    const items = followers.map(f => ({
      ...f.followerId,
      isFollowing: myFollowingSet.has(String(f.followerId?._id)),
    }));
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

// Following list
r.get('/users/:id/following', auth(false), async (req, res, next) => {
  try {
    await db();
    const following = await Follow.find({ followerId: req.params.id })
      .populate('followingId', 'username displayName avatarUrl bio')
      .lean();
    const userIds = following.map(f => f.followingId?._id).filter(Boolean);
    let myFollowingSet = new Set();
    if (req.user?.sub) {
      const myFollowing = await Follow.find({ followerId: req.user.sub, followingId: { $in: userIds } });
      myFollowingSet = new Set(myFollowing.map(f => String(f.followingId)));
    }
    const items = following.map(f => ({
      ...f.followingId,
      isFollowing: myFollowingSet.has(String(f.followingId?._id)),
    }));
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

// Profile & stats
r.get('/users/:username', auth(false), async (req, res, next) => {
  try {
    await db();
    const u = await User.findOne({ username: req.params.username.toLowerCase() }).select('-passwordHash').lean();
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (u.privacy?.profile === 'PRIVATE' && String(u._id) !== req.user?.sub) return res.status(403).json({ error: 'Private profile' });
    const [followers, following, reviews] = await Promise.all([
      Follow.countDocuments({ followingId: u._id }),
      Follow.countDocuments({ followerId: u._id }),
      Review.countDocuments({ userId: u._id, deletedAt: null }),
    ]);
    let isFollowing = false;
    if (req.user?.sub && req.user.sub !== String(u._id)) {
      const f = await Follow.findOne({ followerId: req.user.sub, followingId: u._id });
      isFollowing = !!f;
    }
    res.json({ user: u, stats: { followers, following, reviews }, isFollowing });
  } catch (e) {
    next(e);
  }
});

// Public collection for user
r.get('/users/:username/collection', auth(false), async (req, res, next) => {
  try {
    await db();
    const u = await User.findOne({ username: req.params.username.toLowerCase() }).lean();
    if (!u) return res.status(404).json({ error: 'User not found' });
    const [statuses, favorites, likes] = await Promise.all([
      Status.find({ userId: u._id }).populate('contentId').lean(),
      Favorite.find({ userId: u._id }).populate('contentId').lean(),
      Like.find({ userId: u._id }).populate('contentId').lean(),
    ]);
    res.json({
      watched: statuses.filter(s => s.status === 'WATCHED' || s.status === 'READ').map(s => s.contentId),
      watchlist: statuses.filter(s => s.status === 'WATCHLIST' || s.status === 'WANT_TO_READ').map(s => s.contentId),
      favorites: favorites.map(f => f.contentId),
      likes: likes.map(l => l.contentId),
    });
  } catch (e) {
    next(e);
  }
});

// Review like
r.post('/reviews/:id/like', auth(), async (req, res, next) => {
  try {
    await db();
    const rv = await Review.findById(req.params.id);
    if (!rv) return res.status(404).json({ error: 'Review not found' });
    const x = await ReviewLike.findOne({ userId: req.user?.sub, reviewId: rv._id });
    if (x) {
      await x.deleteOne();
      await Review.updateOne({ _id: rv._id }, { $inc: { likeCount: -1 } });
      return res.json({ liked: false });
    }
    await ReviewLike.create({ userId: req.user?.sub, reviewId: rv._id });
    await Review.updateOne({ _id: rv._id }, { $inc: { likeCount: 1 } });
    await notify(rv.userId, req.user?.sub, 'REVIEW_LIKE', rv._id);
    res.json({ liked: true });
  } catch (e) {
    next(e);
  }
});

// Comments
r.post('/reviews/:id/comments', auth(), async (req, res, next) => {
  try {
    await db();
    const x = z.object({ body: z.string().min(1).max(2000) }).parse(req.body);
    const rv = await Review.findById(req.params.id);
    if (!rv) return res.status(404).json({ error: 'Review not found' });
    const c = await Comment.create({ userId: req.user?.sub, reviewId: rv._id, body: x.body });
    await Review.updateOne({ _id: rv._id }, { $inc: { commentCount: 1 } });
    await notify(rv.userId, req.user?.sub, 'COMMENT', rv._id);
    res.status(201).json({ comment: c });
  } catch (e) {
    next(e);
  }
});

// Activity feed
r.get('/feed', auth(), async (req, res, next) => {
  try {
    await db();
    const following = await Follow.find({ followerId: req.user?.sub }).distinct('followingId');
    const items = await Activity.find({ userId: { $in: [req.user?.sub, ...following] } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'username displayName avatarUrl')
      .lean();
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

// Notifications
r.get('/notifications', auth(), async (req, res, next) => {
  try {
    await db();
    const items = await Notification.find({ userId: req.user?.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actorId', 'username displayName avatarUrl')
      .lean();
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

// Reports
r.post('/reports', auth(), async (req, res, next) => {
  try {
    await db();
    const x = z.object({ targetType: z.string().min(1), targetId: z.string(), reason: z.string().min(3).max(1000) }).parse(req.body);
    const report = await Report.create({ reporterId: req.user?.sub, targetType: x.targetType, targetId: x.targetId, reason: x.reason });
    res.status(201).json({ report });
  } catch (e) {
    next(e);
  }
});

r.get('/reports', auth(), requireRole('MODERATOR', 'ADMIN'), async (req, res, next) => {
  try {
    await db();
    res.json({ items: await Report.find().sort({ createdAt: -1 }).limit(100).lean() });
  } catch (e) {
    next(e);
  }
});

export default r;
