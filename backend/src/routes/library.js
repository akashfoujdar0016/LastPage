import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/mongoose.js';
import { auth } from '../middleware/core.js';
import { Content, Status, List, ListItem, Review, Rating, Favorite, Like, User, Activity } from '../models/index.js';

const router = Router();

// GET /api/me/activity - Cross-device activity timeline
router.get('/activity', auth(false), async (req, res, next) => {
  try {
    await db();
    const activities = await Activity.find({})
      .populate('contentId', 'title slug type imageUrl creatorNames authorNames year averageRating')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ items: activities });
  } catch (err) {
    next(err);
  }
});

// GET /api/me/reviews - Cross-device user reviews
router.get('/reviews', auth(false), async (req, res, next) => {
  try {
    await db();
    const reviews = await Review.find({ deletedAt: null })
      .populate('contentId', 'title slug type imageUrl creatorNames authorNames year averageRating')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

// GET /api/me/library - Full cross-device synced journal
router.get('/library', auth(false), async (req, res, next) => {
  try {
    await db();
    const [statuses, favoritesDocs, likesDocs, ratingsDocs, reviewsDocs] = await Promise.all([
      Status.find({}).populate('contentId').sort({ updatedAt: -1 }).lean(),
      Favorite.find({}).populate('contentId').sort({ updatedAt: -1 }).lean(),
      Like.find({}).populate('contentId').sort({ updatedAt: -1 }).lean(),
      Rating.find({}).populate('contentId').sort({ updatedAt: -1 }).lean(),
      Review.find({ deletedAt: null }).populate('contentId').sort({ createdAt: -1 }).lean(),
    ]);

    const dedupe = (list, keyFn) => {
      const map = new Map();
      for (const it of list) {
        if (!it) continue;
        const key = keyFn(it);
        if (key && !map.has(key)) {
          map.set(key, it);
        }
      }
      return Array.from(map.values());
    };

    const watchedRaw = statuses
      .filter((s) => (s.status === 'WATCHED' || s.status === 'READ') && s.contentId)
      .map((s) => ({ ...s.contentId, loggedDate: s.updatedAt, status: s.status }));
    const watched = dedupe(watchedRaw, (it) => String(it._id || it.slug));

    const watchlistRaw = statuses
      .filter((s) => (s.status === 'WATCHLIST' || s.status === 'WANT_TO_READ') && s.contentId)
      .map((s) => ({ ...s.contentId, status: s.status }));
    const watchlist = dedupe(watchlistRaw, (it) => String(it._id || it.slug));

    const favorites = dedupe(
      favoritesDocs.filter((f) => f.contentId).map((f) => f.contentId),
      (it) => String(it._id || it.slug)
    );

    const likes = dedupe(
      likesDocs.filter((l) => l.contentId).map((l) => l.contentId),
      (it) => String(it._id || it.slug)
    );

    const ratingsRaw = ratingsDocs
      .filter((r) => r.contentId)
      .map((r) => ({ ...r.contentId, userRating: r.score }));
    const ratings = dedupe(ratingsRaw, (it) => String(it._id || it.slug));

    const reviewsRaw = reviewsDocs
      .filter((rv) => rv.contentId)
      .map((rv) => ({
        ...rv.contentId,
        reviewId: rv._id,
        reviewBody: rv.body,
        reviewTitle: rv.title,
        rating: rv.rating,
        createdAt: rv.createdAt,
      }));
    const reviews = dedupe(reviewsRaw, (it) => String(it.reviewId || it._id));

    res.json({
      watched,
      watchlist,
      favorites,
      likes,
      ratings,
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/me - Get user's logged library content
router.get('/', auth(), async (req, res, next) => {
  try {
    await db();
    const type = z.enum(['MOVIE', 'BOOK']).optional().parse(req.query.type);
    const status = z.string().optional().parse(req.query.status);

    const filter = { userId: req.user?.sub };
    if (status) filter.status = status;

    const rows = await Status.find(filter).sort({ updatedAt: -1 }).lean();
    const contentIds = rows.map(r => r.contentId);

    const contentFilter = { _id: { $in: contentIds } };
    if (type) contentFilter.type = type;

    const contents = await Content.find(contentFilter).lean();

    res.json({
      items: rows.map(s => ({
        ...s,
        content: contents.find(c => String(c._id) === String(s.contentId)),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/me/lists - Create custom list
router.post('/lists', auth(), async (req, res, next) => {
  try {
    await db();
    const listData = z.object({
      type: z.enum(['MOVIE', 'BOOK']),
      name: z.string().min(1).max(120),
      description: z.string().max(1000).optional(),
      visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).default('PUBLIC'),
    }).parse(req.body);

    const list = await List.create({
      userId: req.user?.sub,
      ...listData,
    });

    res.status(201).json({ list });
  } catch (err) {
    next(err);
  }
});

// POST /api/me/lists/:id/items - Add item to list
router.post('/lists/:id/items', auth(), async (req, res, next) => {
  try {
    await db();
    const itemData = z.object({
      contentId: z.string(),
      position: z.number().int().min(0).default(0),
    }).parse(req.body);

    const list = await List.findOne({ _id: req.params.id, userId: req.user?.sub });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const item = await ListItem.findOneAndUpdate(
      { listId: list._id, contentId: itemData.contentId },
      { $set: { position: itemData.position } },
      { upsert: true, new: true }
    );

    const totalCount = await ListItem.countDocuments({ listId: list._id });
    await List.updateOne({ _id: list._id }, { $set: { itemCount: totalCount } });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

// GET /api/me/lists - Get user's custom lists
router.get('/lists', auth(), async (req, res, next) => {
  try {
    await db();
    const lists = await List.find({ userId: req.user?.sub }).sort({ updatedAt: -1 }).lean();
    res.json({ items: lists });
  } catch (err) {
    next(err);
  }
});

export default router;
