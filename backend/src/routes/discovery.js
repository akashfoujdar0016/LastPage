import { Router } from 'express';
import { db } from '../db/mongoose.js';
import { auth } from '../middleware/core.js';
import { Content, Rating, Like } from '../models/index.js';

const router = Router();

// GET /api/discovery/home - Curated spotlight and trending content
router.get('/home', auth(false), async (_req, res, next) => {
  try {
    await db();
    const count = await Content.countDocuments({ deletedAt: null });
    if (count < 84) {
      const { seedCatalog } = await import('../services/seeder.js');
      await seedCatalog();
    }
    const [trending, popular, topRated, movies, books] = await Promise.all([
      Content.find({ deletedAt: null }).sort({ popularity: -1 }).limit(12).lean(),
      Content.find({ deletedAt: null }).sort({ likeCount: -1 }).limit(12).lean(),
      Content.find({ deletedAt: null, ratingCount: { $gte: 3 } }).sort({ averageRating: -1 }).limit(12).lean(),
      Content.find({ type: 'MOVIE', deletedAt: null }).sort({ year: -1 }).limit(12).lean(),
      Content.find({ type: 'BOOK', deletedAt: null }).sort({ year: -1 }).limit(12).lean(),
    ]);

    res.json({ trending, popular, topRated, movies, books });
  } catch (err) {
    next(err);
  }
});

// GET /api/discovery/recommendations - Personalized recommendations
router.get('/recommendations', auth(), async (req, res, next) => {
  try {
    await db();
    const rated = await Rating.find({ userId: req.user?.sub }).sort({ updatedAt: -1 }).limit(30).lean();
    const liked = await Like.find({ userId: req.user?.sub }).limit(30).lean();
    const seenIds = [...rated.map(x => x.contentId), ...liked.map(x => x.contentId)];

    const highRatedIds = rated.filter(x => x.score >= 4).map(x => x.contentId);
    const preferred = await Content.find({ _id: { $in: highRatedIds } }).lean();
    const genres = [...new Set(preferred.flatMap(x => x.genres || []))];

    const items = await Content.find({
      deletedAt: null,
      _id: { $nin: seenIds },
      genres: { $in: genres },
    })
      .sort({ popularity: -1, averageRating: -1 })
      .limit(24)
      .lean();

    res.json({ items, signals: { genres } });
  } catch (err) {
    next(err);
  }
});

export default router;
