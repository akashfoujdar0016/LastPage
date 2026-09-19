import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/mongoose.js';
import { auth } from '../middleware/core.js';
import { Content, Status, List, ListItem, Review, Rating, Favorite, Like, Activity } from '../models/index.js';

const router = Router();

// GET /api/me/activity - Cross-device activity timeline (scoped to authenticated user)
router.get('/activity', auth(false), async (req, res, next) => {
  try {
    await db();
    const userId = req.user?.sub;
    if (!userId) return res.json({ items: [] });

    const activities = await Activity.find({ userId })
      .populate('contentId', 'title slug type imageUrl creatorNames authorNames year averageRating')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const missingIds = activities
      .filter((a) => !a.contentId?.title && a.contentId)
      .map((a) => String(a.contentId?._id || a.contentId));

    if (missingIds.length > 0) {
      const fallbackContents = await Content.find({ _id: { $in: missingIds } }).lean();
      const map = new Map(fallbackContents.map((c) => [String(c._id), c]));
      for (const a of activities) {
        if (!a.contentId?.title && a.contentId) {
          const found = map.get(String(a.contentId?._id || a.contentId));
          if (found) a.contentId = found;
        }
      }
    }

    res.json({ items: activities });
  } catch (err) {
    next(err);
  }
});

// GET /api/me/reviews - Cross-device user reviews (scoped to authenticated user)
router.get('/reviews', auth(false), async (req, res, next) => {
  try {
    await db();
    const userId = req.user?.sub;
    if (!userId) return res.json({ reviews: [] });

    const reviews = await Review.find({ userId, deletedAt: null })
      .populate('contentId', 'title slug type imageUrl creatorNames authorNames year averageRating')
      .sort({ createdAt: -1 })
      .lean();

    const missingIds = reviews
      .filter((r) => !r.contentId?.title && r.contentId)
      .map((r) => String(r.contentId?._id || r.contentId));

    if (missingIds.length > 0) {
      const fallbackContents = await Content.find({ _id: { $in: missingIds } }).lean();
      const map = new Map(fallbackContents.map((c) => [String(c._id), c]));
      for (const r of reviews) {
        if (!r.contentId?.title && r.contentId) {
          const found = map.get(String(r.contentId?._id || r.contentId));
          if (found) r.contentId = found;
        }
      }
    }

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

// GET /api/me/library - Full cross-device synced journal (scoped to authenticated user)
router.get('/library', auth(false), async (req, res, next) => {
  try {
    await db();
    const userId = req.user?.sub;
    if (!userId) {
      return res.json({ watched: [], watchlist: [], favorites: [], likes: [], ratings: [], reviews: [] });
    }

    const [statuses, favoritesDocs, likesDocs, ratingsDocs, reviewsDocs] = await Promise.all([
      Status.find({ userId }).populate('contentId').sort({ updatedAt: -1 }).lean(),
      Favorite.find({ userId }).populate('contentId').sort({ updatedAt: -1 }).lean(),
      Like.find({ userId }).populate('contentId').sort({ updatedAt: -1 }).lean(),
      Rating.find({ userId }).populate('contentId').sort({ updatedAt: -1 }).lean(),
      Review.find({ userId, deletedAt: null }).populate('contentId').sort({ createdAt: -1 }).lean(),
    ]);

    // Collect any unpopulated content IDs
    const allContentIds = new Set();
    const collectId = (doc) => {
      const cid = doc.contentId?._id || doc.contentId;
      if (cid) allContentIds.add(String(cid));
    };
    statuses.forEach(collectId);
    favoritesDocs.forEach(collectId);
    likesDocs.forEach(collectId);
    ratingsDocs.forEach(collectId);
    reviewsDocs.forEach(collectId);

    const contents = await Content.find({ _id: { $in: Array.from(allContentIds) } }).lean();
    const contentMap = new Map();
    for (const c of contents) {
      contentMap.set(String(c._id), c);
      if (c.slug) contentMap.set(c.slug, c);
    }

    const resolveContent = (doc) => {
      if (doc.contentId && doc.contentId.title) return doc.contentId;
      const cid = String(doc.contentId?._id || doc.contentId);
      return contentMap.get(cid) || null;
    };

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

    const watchedRaw = [];
    for (const s of statuses) {
      if (s.status === 'WATCHED' || s.status === 'READ') {
        const c = resolveContent(s);
        if (c) watchedRaw.push({ ...c, loggedDate: s.updatedAt, status: s.status });
      }
    }
    const watched = dedupe(watchedRaw, (it) => String(it._id || it.slug));

    const watchlistRaw = [];
    for (const s of statuses) {
      if (s.status === 'WATCHLIST' || s.status === 'WANT_TO_READ') {
        const c = resolveContent(s);
        if (c) watchlistRaw.push({ ...c, status: s.status });
      }
    }
    const watchlist = dedupe(watchlistRaw, (it) => String(it._id || it.slug));

    const favoritesRaw = [];
    for (const f of favoritesDocs) {
      const c = resolveContent(f);
      if (c) favoritesRaw.push(c);
    }
    const favorites = dedupe(favoritesRaw, (it) => String(it._id || it.slug));

    const likesRaw = [];
    for (const l of likesDocs) {
      const c = resolveContent(l);
      if (c) likesRaw.push(c);
    }
    const likes = dedupe(likesRaw, (it) => String(it._id || it.slug));

    const ratingsRaw = [];
    for (const r of ratingsDocs) {
      const c = resolveContent(r);
      if (c) ratingsRaw.push({ ...c, userRating: r.score });
    }
    const ratings = dedupe(ratingsRaw, (it) => String(it._id || it.slug));

    const reviewsRaw = [];
    for (const rv of reviewsDocs) {
      const c = resolveContent(rv);
      if (c) {
        reviewsRaw.push({
          ...c,
          reviewId: rv._id,
          reviewBody: rv.body,
          reviewTitle: rv.title,
          rating: rv.rating,
          createdAt: rv.createdAt,
        });
      }
    }
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
