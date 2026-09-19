import {
  Content,
  Rating,
  Review,
  ReviewLike,
  Comment,
  Like,
  Favorite,
  Status,
  Activity,
} from '../models/index.js';
import { catalog } from '../data/catalog.js';

/**
 * Purges legacy placeholder data & dummy user interactions,
 * then idempotently seeds/upserts exactly 50 movies and 30 books (80 total)
 * with zero dummy statistics (averageRating: 0, ratingCount: 0, etc.).
 */
export async function seedCatalog() {
  // 1. Purge all dummy interactions, ratings, reviews, likes, favorites, statuses, and activities
  await Promise.all([
    Rating.deleteMany({}),
    Review.deleteMany({}),
    ReviewLike.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({}),
    Favorite.deleteMany({}),
    Status.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  // 2. Remove legacy placeholder Content documents not in the production catalog
  const validTitles = catalog.map((c) => c.title);
  await Content.deleteMany({ title: { $nin: validTitles } });

  // 3. Upsert clean catalog items with 0 stats
  let seededCount = 0;
  for (const item of catalog) {
    const slug = String(item.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    await Content.updateOne(
      { type: item.type, title: item.title },
      {
        $set: {
          ...item,
          slug,
          averageRating: 0,
          ratingCount: 0,
          likeCount: 0,
          favoriteCount: 0,
          popularity: 0,
        },
      },
      { upsert: true }
    );
    seededCount++;
  }

  return seededCount;
}
