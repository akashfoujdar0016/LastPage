import { Router } from 'express';
import { z } from 'zod';
import { Content, Rating, Like, Favorite, Status, Review } from '../models/index.js';
import { db } from '../db/mongoose.js';
import { auth } from '../middleware/core.js';
import { enrich, recalcRating } from '../services/content.js';
import { activity } from '../services/social.js';
import { seedCatalog } from '../services/seeder.js';

const router = Router();

// GET & POST /api/content/seed - Explicitly trigger production catalog seed
router.all('/seed', async (_req, res, next) => {
  try {
    await db();
    const count = await seedCatalog();
    res.json({ ok: true, message: `Production catalog seeded with ${count} entries (50 movies, 30 books).` });
  } catch (err) {
    next(err);
  }
});

// GET /api/content - List/search content
router.get('/', auth(false), async (req, res, next) => {
  try {
    await db();
    const count = await Content.countDocuments({ deletedAt: null });
    if (count < 80) {
      await seedCatalog();
    }
    const query = z.object({
      type: z.enum(['MOVIE', 'BOOK']).optional(),
      q: z.string().trim().max(100).optional(),
      genre: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(60).default(20),
      sort: z.enum(['popular', 'rating', 'new']).default('popular'),
    }).parse(req.query);

    const filter = { deletedAt: null };
    if (query.type) filter.type = query.type;
    if (query.genre) filter.genres = query.genre;
    if (query.q) {
      filter.$or = [
        { title: { $regex: query.q, $options: 'i' } },
        { originalTitle: { $regex: query.q, $options: 'i' } },
        { creatorNames: { $regex: query.q, $options: 'i' } },
        { authorNames: { $regex: query.q, $options: 'i' } },
        { isbn: { $regex: query.q, $options: 'i' } },
      ];
    }

    const sortOption = query.sort === 'rating'
      ? { averageRating: -1, ratingCount: -1 }
      : query.sort === 'new'
      ? { year: -1, _id: -1 }
      : { popularity: -1, likeCount: -1 };

    const items = await Content.find(filter)
      .sort(sortOption)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean();

    const enrichedItems = await Promise.all(
      items.map(item => enrich(item, req.user?.sub))
    );

    res.json({
      items: enrichedItems,
      page: query.page,
      limit: query.limit,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/content/:id - Single item with reviews
router.get('/:id', auth(false), async (req, res, next) => {
  try {
    await db();
    const content = await Content.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const reviews = await Review.find({ contentId: content._id, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('userId', 'username displayName avatarUrl')
      .lean();

    res.json({
      content: await enrich(content, req.user?.sub),
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/content/:id/status - Update watch/reading status
router.post('/:id/status', auth(), async (req, res, next) => {
  try {
    await db();
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const allowedStatuses = content.type === 'MOVIE'
      ? ['WATCHED', 'WATCHLIST']
      : ['WANT_TO_READ', 'CURRENTLY_READING', 'READ'];

    const schema = z.object({
      status: z.string(),
      progress: z.number().int().min(0).max(100).optional(),
    }).parse(req.body);

    if (!allowedStatuses.includes(schema.status)) {
      return res.status(400).json({ error: 'Invalid status for content type' });
    }

    const isCompleted = schema.status === 'WATCHED' || schema.status === 'READ';
    const updatedStatus = await Status.findOneAndUpdate(
      { userId: req.user?.sub, contentId: content._id },
      {
        $set: {
          status: schema.status,
          progress: schema.progress,
          completedAt: isCompleted ? new Date() : undefined,
        },
      },
      { upsert: true, new: true }
    );

    await activity(req.user?.sub, schema.status, content._id);
    res.json({ status: updatedStatus });
  } catch (err) {
    next(err);
  }
});

// POST /api/content/:id/rating - Rate content (0.5 to 5.0)
router.post('/:id/rating', auth(), async (req, res, next) => {
  try {
    await db();
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const { score } = z.object({
      score: z.number().min(0.5).max(5),
    }).parse(req.body);

    const updatedRating = await Rating.findOneAndUpdate(
      { userId: req.user?.sub, contentId: content._id },
      { $set: { score } },
      { upsert: true, new: true }
    );

    await recalcRating(content._id);
    await activity(req.user?.sub, 'RATED', content._id);
    res.json({ rating: updatedRating });
  } catch (err) {
    next(err);
  }
});

// Helper for toggle operations (like / favorite)
async function toggleInteraction(Model, field, actionType, req, res) {
  const content = await Content.findById(req.params.id);
  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }

  const existing = await Model.findOne({ userId: req.user?.sub, contentId: content._id });
  if (existing) {
    await Model.deleteOne({ _id: existing._id });
    await Content.updateOne({ _id: content._id }, { $inc: { [field]: -1 } });
    return res.json({ active: false });
  }

  await Model.create({ userId: req.user?.sub, contentId: content._id });
  await Content.updateOne({ _id: content._id }, { $inc: { [field]: 1 } });
  await activity(req.user?.sub, actionType, content._id);
  res.json({ active: true });
}

// POST /api/content/:id/like
router.post('/:id/like', auth(), (req, res, next) =>
  toggleInteraction(Like, 'likeCount', 'LIKED', req, res).catch(next)
);

// POST /api/content/:id/favorite
router.post('/:id/favorite', auth(), (req, res, next) =>
  toggleInteraction(Favorite, 'favoriteCount', 'FAVORITED', req, res).catch(next)
);

// POST /api/content/:id/reviews - Create review
router.post('/:id/reviews', auth(), async (req, res, next) => {
  try {
    await db();
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const reviewData = z.object({
      body: z.string().min(1).max(10000),
      spoiler: z.boolean().default(false),
    }).parse(req.body);

    const review = await Review.create({
      userId: req.user?.sub,
      contentId: content._id,
      ...reviewData,
    });

    await activity(req.user?.sub, 'REVIEWED', content._id, review._id);
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/content/:contentId/reviews/:reviewId - Update review
router.patch('/:contentId/reviews/:reviewId', auth(), async (req, res, next) => {
  try {
    await db();
    const updateData = z.object({
      body: z.string().min(1).max(10000).optional(),
      spoiler: z.boolean().optional(),
    }).parse(req.body);

    const review = await Review.findOneAndUpdate(
      {
        _id: req.params.reviewId,
        contentId: req.params.contentId,
        userId: req.user?.sub,
        deletedAt: null,
      },
      { $set: updateData },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ review });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/content/:contentId/reviews/:reviewId - Soft-delete review
router.delete('/:contentId/reviews/:reviewId', auth(), async (req, res, next) => {
  try {
    await db();
    const review = await Review.findOneAndUpdate(
      {
        _id: req.params.reviewId,
        contentId: req.params.contentId,
        userId: req.user?.sub,
        deletedAt: null,
      },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
