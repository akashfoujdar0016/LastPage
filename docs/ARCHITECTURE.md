# Architecture — LastPage

LastPage is a monorepo containing an independently deployable Next.js frontend and an Express API backend. The API is fully stateless (except MongoDB-backed session records), enabling horizontal scaling on Vercel serverless infrastructure.

---

## System Topology

```
Browser
  └── Vercel Frontend (Next.js · port 3000 locally)
        └── Vercel Backend API (Express · port 4000 locally)
              └── MongoDB Atlas (cloud database)
```

---

## Domain Model

| Domain | Responsibility |
|---|---|
| Auth & Sessions | Register, login, JWT access/refresh tokens, logout |
| Users | Profiles, privacy settings, follows, blocks |
| Catalog | Movies and books (content documents) |
| Interactions | Ratings, likes, favorites, statuses |
| Reviews | Full reviews, comments, review likes, spoiler flags |
| Lists & Shelves | Ordered movie lists, book shelves, visibility |
| Activity & Notifications | Feed entries, notification records |
| Search & Discovery | Full-text search, home feed, recommendations |
| Moderation | User reports, moderator actions, audit logs |

---

## Frontend Structure (`frontend/src/`)

```
app/
  page.jsx          ← Home (split-screen auth + brand)
  hub/              ← Section selector (Movies / Books)
  movies/           ← Movie browse + detail
  books/            ← Book browse + detail
  library/          ← Personal library (watched, shelves, etc.)
  profile/          ← Public user profiles
  search/           ← Global search
  activity/         ← Activity feed
  notifications/    ← Notification centre
  login/            ← Standalone login page
components/
  Nav.jsx           ← Side-aligned navbar (logo+links left, auth right)
  ContentCard.jsx   ← Movie/book grid card
lib/
  api.js            ← Fetch wrapper + auth helpers
```

---

## Backend Structure (`backend/src/`)

```
server.js           ← Express app entry point
config/env.js       ← Zod-validated environment config
db/mongoose.js      ← Cached Mongoose connection (serverless-safe)
middleware/
  core.js           ← Helmet, CORS, auth middleware, requireRole
models/index.js     ← All Mongoose models in one file
routes/
  auth.js           ← /api/auth — register, login, refresh, /me
  content.js        ← /api/content — catalog + interactions
  social.js         ← /api/social — follows, feed, notifications, reports
  library.js        ← /api/me — user library + lists
  discovery.js      ← /api/discovery — home feed + recommendations
utils/auth.js       ← JWT sign/verify, token hashing
seed.js             ← Demo data seeder
```

---

## MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | User accounts, profile, role, privacy |
| `refreshtokens` | Refresh token hashes + expiry |
| `contents` | Movies and books (type: MOVIE/BOOK) |
| `usercontents` | Status, rating, like, favorite per user/content |
| `reviews` | Full review text, spoiler flag, like count |
| `reviewlikes` | Review like relationships |
| `comments` | Review comments |
| `follows` | Follow relationships |
| `blocks` | Block relationships |
| `lists` | Movie lists (ordered) |
| `listitems` | Items within a list |
| `shelves` | Book shelves |
| `activities` | Activity feed entries |
| `notifications` | Notification records |
| `reports` | Moderation reports |

Denormalized counters (`averageRating`, `ratingCount`, `likeCount`) are stored on Content and Review documents for read performance. Compound unique indexes enforce relationship uniqueness (e.g., `{userId, contentId}` on UserContent).

---

## Security

- **Passwords** hashed with `bcryptjs` (cost factor 12)
- **Access tokens** short-lived JWTs (default 15 min)
- **Refresh tokens** stored as SHA-256 hashes; rotated on every use
- **Zod** validates all request bodies and query params
- **CORS** allowlist configured via `CORS_ORIGINS` env var
- **Helmet** sets standard security headers
- **Body limit** 1 MB on `express.json()`
- **Soft deletion** for reviews and sensitive records
- **Privacy checks** before profile/activity/list exposure

---

## Serverless Constraints

- Reuse a single Mongoose connection per warm Vercel function invocation (`db/mongoose.js` caching pattern)
- No in-memory queues, long-lived sockets, or local file persistence
- Background jobs (content imports, email, notifications at scale) require external infrastructure (e.g., Vercel Cron, Upstash, BullMQ on a dedicated service)
