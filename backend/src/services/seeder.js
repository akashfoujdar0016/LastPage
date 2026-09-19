import { Content } from '../models/index.js';
import { catalog } from '../data/catalog.js';

/**
 * Idempotently seeds/upserts all 52 movies and 32 books into the database.
 */
export async function seedCatalog() {
  let seededCount = 0;
  for (const item of catalog) {
    const slug = String(item.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    await Content.updateOne(
      { type: item.type, title: item.title },
      { $set: { ...item, slug } },
      { upsert: true }
    );
    seededCount++;
  }
  return seededCount;
}
