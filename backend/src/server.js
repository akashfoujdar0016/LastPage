import express from 'express';
import { db } from './db/mongoose.js';
import { env } from './config/env.js';
import { security } from './middleware/core.js';
import authRouter from './routes/auth.js';
import contentRouter from './routes/content.js';
import socialRouter from './routes/social.js';
import libraryRouter from './routes/library.js';
import discoveryRouter from './routes/discovery.js';

const app = express();

app.set('trust proxy', 1);
app.use(...security);
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', async (_, res) => {
  try {
    await db();
    res.json({ ok: true, service: 'cinefolio-api', db: 'connected' });
  } catch {
    res.status(503).json({ ok: false, db: 'unavailable' });
  }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/social', socialRouter);
app.use('/api/me', libraryRouter);
app.use('/api/discovery', discoveryRouter);

// Centralized Error Handling
app.use((err, _req, res, _next) => {
  console.error('[API Error]:', err?.message || err);
  const status = err?.name === 'ZodError' ? 400 : (err?.status || 500);
  const message = err?.message;
  res.status(status).json({
    error: err?.name === 'ZodError' ? 'Invalid request data' : 'Internal server error',
    details: env.NODE_ENV === 'production' ? undefined : message,
  });
});

if (process.env.VERCEL !== '1') {
  app.listen(env.PORT, () => {
    console.log(`LastPage API listening on port ${env.PORT}`);
  });
}

export default app;
