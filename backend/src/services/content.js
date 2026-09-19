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
    ? Math.round(aggregateResult[0].avg * 100) / 100
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
}
