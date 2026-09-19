import { Content, Rating, Like, Favorite, Status } from '../models/index.js';

export async function enrich(content, userId) {
  if (!content) return null;
  const contentObj = content.toObject ? content.toObject() : content;

  if (userId) {
    const [ratingDoc, likeDoc, favoriteDoc, statusDoc] = await Promise.all([
      Rating.findOne({ userId, contentId: contentObj._id }).lean(),
      Like.findOne({ userId, contentId: contentObj._id }).lean(),
      Favorite.findOne({ userId, contentId: contentObj._id }).lean(),
      Status.findOne({ userId, contentId: contentObj._id }).lean(),
    ]);

    return {
      ...contentObj,
      myRating: ratingDoc?.score ?? null,
      liked: !!likeDoc,
      favorited: !!favoriteDoc,
      status: statusDoc?.status ?? null,
      progress: statusDoc?.progress ?? null,
    };
  }

  return contentObj;
}

export async function getRatingBreakdown(contentId) {
  const ratings = await Rating.find({ contentId }).lean();
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of ratings) {
    const star = Math.min(5, Math.max(1, Math.round(r.score)));
    counts[star] = (counts[star] || 0) + 1;
  }
  const total = ratings.length;
  const percentages = {
    5: total > 0 ? Math.round((counts[5] / total) * 100) : 0,
    4: total > 0 ? Math.round((counts[4] / total) * 100) : 0,
    3: total > 0 ? Math.round((counts[3] / total) * 100) : 0,
    2: total > 0 ? Math.round((counts[2] / total) * 100) : 0,
    1: total > 0 ? Math.round((counts[1] / total) * 100) : 0,
  };
  return { counts, percentages, total };
}

export async function recalcRating(contentId) {
  const aggregateResult = await Rating.aggregate([
    { $match: { contentId } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$score' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgScore = aggregateResult[0]?.avg
    ? Math.round(aggregateResult[0].avg * 10) / 10
    : 0;
  const ratingCount = aggregateResult[0]?.count || 0;

  await Content.updateOne(
    { _id: contentId },
    {
      $set: {
        averageRating: avgScore,
        ratingCount,
      },
    }
  );

  const breakdown = await getRatingBreakdown(contentId);
  return { averageRating: avgScore, ratingCount, breakdown };
}
