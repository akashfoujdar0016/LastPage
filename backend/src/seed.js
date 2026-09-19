import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './db/mongoose.js';
import { User } from './models/index.js';
import { seedCatalog } from './services/seeder.js';
import { catalog } from './data/catalog.js';

await db();

// Seed Demo User
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

const count = await seedCatalog();
const movies = catalog.filter((c) => c.type === 'MOVIE').length;
const books = catalog.filter((c) => c.type === 'BOOK').length;

console.log(
  `Seeding complete: ${count} cultural entries catalogued (${movies} movies, ${books} books) in database.`
);
process.exit(0);
