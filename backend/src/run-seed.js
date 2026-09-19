import 'dotenv/config';
import mongoose from 'mongoose';
import { catalog } from './data/catalog.js';
import { Content, User } from './models/index.js';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'cinefolio';

console.log('Connecting to MongoDB Atlas...');

try {
  await mongoose.connect(MONGODB_URI, {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 15000,
  });
  console.log('Connected to MongoDB database:', DB_NAME);

  // Upsert demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  await User.updateOne(
    { email: 'demo@example.com' },
    {
      $set: {
        username: 'curator',
        email: 'demo@example.com',
        passwordHash,
        displayName: 'Editorial Curator',
        bio: 'Private cultural journal documenting cinema retrospectives and literary canons.',
      },
    },
    { upsert: true }
  );
  console.log('Curator user verified.');

  console.log(`Storing ${catalog.length} items (movies & books) into database...`);

  let count = 0;
  for (const item of catalog) {
    const slug = String(item.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    await Content.updateOne(
      { type: item.type, title: item.title },
      { $set: { ...item, slug, deletedAt: null } },
      { upsert: true }
    );
    count++;
  }

  const totalMovies = await Content.countDocuments({ type: 'MOVIE', deletedAt: null });
  const totalBooks = await Content.countDocuments({ type: 'BOOK', deletedAt: null });
  const totalEntries = await Content.countDocuments({ deletedAt: null });

  console.log('====================================================');
  console.log(`SUCCESS! Total stored in MongoDB: ${totalEntries} entries`);
  console.log(`- Movies in DB: ${totalMovies}`);
  console.log(`- Books in DB:  ${totalBooks}`);
  console.log('====================================================');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
  process.exit(0);
} catch (error) {
  console.error('Failed to store items in MongoDB:', error);
  process.exit(1);
}
