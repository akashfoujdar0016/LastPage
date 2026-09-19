import { Content, Rating, Like, Favorite, Status } from '../models/index.js';

export async function enrich(content, userId) {
  if (!content) return null;
  const contentObj = content.toObject ? content.toObject() : content;

  let ratingDoc = null;
  let likeDoc = null;
  let favoriteDoc = null;
  let statusDoc = null;

  if (userId) {
    [ratingDoc, likeDoc, favoriteDoc, statusDoc] = await Promise.all([
      Rating.findOne({ userId, contentId: contentObj._id }).lean(),
      Like.findOne({ userId, contentId: contentObj._id }).lean(),
      Favorite.findOne({ userId, contentId: contentObj._id }).lean(),
      Status.findOne({ userId, contentId: contentObj._id }).lean(),
    ]);
  }

  // If specific userId has no rating, check if this content has any rating logged in the shared journal
  let myScore = ratingDoc?.score ?? null;
  if (!myScore) {
    const fallbackRating = await Rating.findOne({ contentId: contentObj._id }).sort({ updatedAt: -1 }).lean();
    if (fallbackRating?.score) {
      myScore = fallbackRating.score;
    }
  }

  return {
    ...contentObj,
    myRating: myScore,
    liked: !!likeDoc,
    favorited: !!favoriteDoc,
    status: statusDoc?.status ?? (myScore ? (contentObj.type === 'MOVIE' ? 'WATCHED' : 'READ') : null),
    progress: statusDoc?.progress ?? null,
  };
}

export async function getRatingBreakdown(contentId) {
  const ratings = await Rating.find({ contentId }).lean();
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  for (const r of ratings) {
    const s = Number(r.score) || 0;
    sum += s;
    const star = Math.min(5, Math.max(1, Math.round(s)));
    counts[star] = (counts[star] || 0) + 1;
  }
  const total = ratings.length;
  const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
  const percentages = {
    5: total > 0 ? Math.round((counts[5] / total) * 100) : 0,
    4: total > 0 ? Math.round((counts[4] / total) * 100) : 0,
    3: total > 0 ? Math.round((counts[3] / total) * 100) : 0,
    2: total > 0 ? Math.round((counts[2] / total) * 100) : 0,
    1: total > 0 ? Math.round((counts[1] / total) * 100) : 0,
  };
  return { counts, percentages, total, avg };
}

export async function recalcRating(contentId) {
  const breakdown = await getRatingBreakdown(contentId);

  await Content.updateOne(
    { _id: contentId },
    {
      $set: {
        averageRating: breakdown.avg,
        ratingCount: breakdown.total,
      },
    }
  );

  return {
    averageRating: breakdown.avg,
    ratingCount: breakdown.total,
    breakdown,
  };
}
