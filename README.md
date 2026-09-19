# LastPage

**LastPage** is a luxury editorial journal and social discovery platform for films and books. Inspired by the aesthetics of Linear, A24, and Letterboxd, LastPage gives cinephiles and bibliophiles an elevated, distraction-free space to track what they've finished, rate and review with nuance, discover peers, and curate their personal cultural archive.

---

## Current Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) · React 19 · Tailwind CSS v3 · Lucide React |
| Typography | Playfair Display (editorial serif) · Inter (sans-serif) · JetBrains Mono (monospace stats) |
| Design System | Bespoke Dark Graphite Palette (`#121216` base canvas, `#1C1C22` card surfaces, `#24242C` hover surfaces, Ember `#E8553D` cinema accent & Gold `#FBBF24` literature/rating accent) |
| Backend | Node.js · Express.js · REST API · Zod validation |
| Database | MongoDB Atlas · Mongoose ODM (16 schemas with bidirectional references & auto-population) |
| Authentication | JWT Access Token (365d TTL) + Rotating Refresh Tokens · bcryptjs password hashing · Offline fallback |
| Media Catalog | 84 Curated Works (52 iconic films & 32 landmark books) with high-res artwork, release years, directors, authors, and synopses |
| Deployment | Vercel (Unified monorepo serverless deployment for Next.js 15 frontend and Express API backend) |

---

## Monorepo Layout

```
LastPage/
├── frontend/                         # Next.js 15 web application (port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx              # Single-viewport editorial landing page
│   │   │   ├── hub/                  # Atmosphere portal gateway (Cinema vs Library)
│   │   │   ├── movies/               # Cinema journal & item detail pages
│   │   │   ├── books/                # Library journal & item detail pages
│   │   │   ├── activity/             # Dual-feed cultural activity stream (Friends & Personal)
│   │   │   ├── profile/              # User profile, Bento stats, & Find Friends search
│   │   │   ├── user/[username]/      # Public peer taste profiles & archives
│   │   │   ├── watchlist/            # Cinema watchlist collection
│   │   │   ├── reading-list/         # Books reading list collection
│   │   │   ├── favourites/           # Unified favourites collection (Cinema & Library tabs)
│   │   │   ├── favorites/            # Alias route to favourites
│   │   │   ├── liked/                # Liked media collection
│   │   │   ├── login/                # Dedicated sign-in page with ambient glows
│   │   │   ├── register/             # Registration route (redirects to auth)
│   │   │   ├── browse.jsx            # Unified media browse & search engine
│   │   │   ├── detail.jsx            # Unified item detail, rating widget & review engine
│   │   │   ├── globals.css           # Design tokens, base resets, animations & scrollbars
│   │   │   └── layout.jsx            # RootLayout with typography, viewport & sticky navigation
│   │   ├── components/               # Reusable UI components
│   │   │   ├── AuthCard.jsx          # Streamlined authentication & account management card
│   │   │   ├── CollectionLayout.jsx  # Reusable collection view with dual tabs & cloud sync
│   │   │   ├── ContentCard.jsx       # Editorial poster card with hover actions & quick links
│   │   │   ├── EditProfileModal.jsx  # Profile customization (avatar URL, bio, genres, links)
│   │   │   ├── FollowModal.jsx       # Modal for followers & following with real-time search
│   │   │   └── Nav.jsx               # Global sticky frosted-glass header with dynamic avatar
│   │   └── lib/                      # Client stores & API client
│   │       ├── activityStore.js      # Reactive client activity & logging storage
│   │       ├── api.js                # Fetch wrapper with auto-retry & dynamic origin resolution
│   │       ├── curatedCatalogue.js   # 84 curated cinema & literature works with fallback cache
│   │       └── socialStore.js        # Social graph layer, peer profiles & user discovery
├── backend/                          # Express.js REST API (port 4000)
│   ├── src/
│   │   ├── config/                   # Environment configuration & Zod schema validation
│   │   ├── data/                     # Authentic catalog seed data (52 movies, 32 books)
│   │   ├── db/                       # MongoDB connection pooling & Mongoose lifecycle
│   │   ├── middleware/               # JWT authentication, role guards & error handlers
│   │   ├── models/                   # 16 Mongoose models (User, Content, Rating, Review, etc.)
│   │   ├── routes/                   # API route handlers
│   │   │   ├── auth.js               # Registration, login, token refresh, profile update
│   │   │   ├── content.js            # Catalog search, ratings, reviews, likes, status
│   │   │   ├── discovery.js          # Curated spotlight, trending, top-rated & recommendations
│   │   │   ├── library.js            # User journal, cross-device sync, activity & custom lists
│   │   │   └── social.js             # Follow graph, user profiles, notifications & reports
│   │   ├── services/                 # Business logic & domain services
│   │   │   ├── content.js            # Rating calculation, breakdown stats & content enrichment
│   │   │   ├── seeder.js             # Database seeding logic for 84 curated works
│   │   │   └── social.js             # Notification & activity dispatching
│   │   ├── utils/                    # Password hashing, token signing & helper utilities
│   │   ├── run-seed.js               # Standalone seeder runner script
│   │   ├── seed.js                   # Development database seed script
│   │   └── server.js                 # Express server initialization & middleware stack
├── REQUIREMENTS.md                   # Complete product requirements specification (v3.0)
├── WORKFLOW.md                       # Comprehensive user journeys & system workflows (v3.0)
└── vercel.json                       # Monorepo multi-service deployment configuration
```

---

## Key Features & Architecture

- **Authentic 84-Item Curated Catalog**: 52 landmark films and 32 iconic books populated with authentic high-resolution artwork (TMDB / Open Library / Google Books), release years, directors, authors, runtimes, page counts, and genre classifications.
- **Full Cloud MongoDB Persistence**: All user accounts, watch/read statuses, star ratings, text reviews, marginalia notes, likes, favourites, custom lists, and activities persist to MongoDB Atlas with complete cross-device synchronization between mobile and desktop devices.
- **Precision Half-Star Rating Engine**: 0.5 to 5.0 star interactive rating widget with 10-tier percentage breakdown visualization, score distribution counts, and real-time community average recalculation.
- **Full Profile Customization**: Seamless profile editing via `EditProfileModal` allowing users to update display name, bio, avatar (monogram, upload, or custom image URL), location, website, and favorite genre pills.
- **Interactive Social Graph & Friend Discovery**:
  - Live **Find Friends** search bar in `/profile` matching curators across display name, username, or bio keyword.
  - Clickable **Following** and **Followers** counters opening an interactive inspection modal with live search filtering and direct follow toggling.
  - Public peer taste profiles (`/user/[username]`) showcasing friend logs, ratings, reviews, favourite films, and personal activity feeds.
- **Dual Cultural Activity Stream (`/activity`)**: Split timeline view toggleable between **Friends Activity** and **Your Journal**, grouped by relative days (Today, Yesterday, Date), with likeable activity cards.
- **Single-Viewport Landing Page (`/`)**: Strictly non-scrollable hero viewport (`h-screen overflow-hidden`) with editorial brand statement on the left and streamlined authentication card on the right.
- **Atmospheric Portal Gateway (`/hub`)**: Photographic portal cards providing an immersive gateway into **Cinema** (`/movies`) and **Library** (`/books`).
- **Resilient Multi-Device Architecture**:
  - 365-day access token TTL preventing unexpected logouts across devices.
  - Dynamic API origin detection in `api.js` automatically adapting between local development (`localhost:4000`) and production deployment.
  - Robust content resolution supporting MongoDB `ObjectId`, canonical slug, or sanitized title parameters.
  - Hydration-safe client rendering with `suppressHydrationWarning` and safe mounting guards.

---

## Local Development

### Prerequisites
- Node.js 18+ or 20+
- MongoDB Atlas cluster URI (or local MongoDB instance)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` (or `backend/.env.local`):
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/cinefolio?retryWrites=true&w=majority
MONGODB_DB_NAME=cinefolio
JWT_ACCESS_SECRET=your-random-32-char-access-secret-here
JWT_REFRESH_SECRET=your-random-32-char-refresh-secret-here
ACCESS_TOKEN_TTL=365d
REFRESH_TOKEN_TTL_DAYS=30
CORS_ORIGINS=http://localhost:3000
```

Start the backend API server:
```bash
npm run dev   # Runs on http://localhost:4000 with hot reload
```

Seed the catalog with all 84 curated works:
```bash
npm run seed
```
*(The backend also auto-seeds automatically upon first request if fewer than 80 items are detected).*

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the Next.js dev server:
```bash
npm run dev   # Runs on http://localhost:3000
```

---

## Active Application Routes

| Route | Description |
|---|---|
| `/` | Single-viewport editorial hero landing page & streamlined auth card |
| `/hub` | Atmospheric visual portal gateway to Cinema & Library |
| `/movies` | Cinema catalog, filter tabs, watchlist, favourites, and logged films |
| `/movies/[id]` | Film detail page with 0.5–5.0 star rating, watch status, marginalia, and reviews |
| `/books` | Library catalog, reading list, favourites, and logged books |
| `/books/[id]` | Book detail page with star rating, reading status, notes, and reviews |
| `/activity` | Social activity timeline feed (Friends & Personal tabs) with relative date headers |
| `/profile` | User profile, Bento stat cards, bio/avatar editor, and live Find Friends search |
| `/user/[username]` | Public taste profile of peer curators with collection tabs & follow action |
| `/watchlist` | Dedicated cinema watchlist collection page |
| `/reading-list` | Dedicated book reading list collection page |
| `/favourites` | Unified favourites collection (Cinema & Library tabs) |
| `/favorites` | American spelling alias route redirecting to favourites |
| `/liked` | Unified liked works collection (Cinema & Library tabs) |
| `/login` | Dedicated sign-in page with ambient glows |
| `/register` | Registration redirect to authentication flow |

---

## Deployment

LastPage is architected for zero-configuration serverless deployment on Vercel:
- **Frontend**: Rooted at `frontend/` deploying Next.js 15 App Router.
- **Backend**: Rooted at `backend/` deploying Express API endpoints as serverless functions.
- **Monorepo Rewrites**: Root `vercel.json` automatically routes `/api/*` requests to the Express backend and all other routes to the Next.js frontend.
- **Database**: MongoDB Atlas with connection pooling and warm connection reuse for optimal serverless execution.

---

## Recent Updates (Version 3.0 Production Ready)

- **Complete Cloud Persistence & Cross-Device Sync**: All user accounts, watch/read statuses, ratings, reviews, marginalia, likes, favourites, and activities are fully persisted in MongoDB Atlas, enabling flawless synchronization across laptop and mobile devices.
- **Authentic 84-Item Media Catalog**: Purged all placeholder/dummy records in favor of 52 iconic movies and 32 landmark books with high-resolution poster artwork, directors, authors, runtimes, and synopses.
- **Advanced Profile Customization**: Introduced `EditProfileModal` supporting custom image avatar URLs, monogram generation, file uploads, display name, bio, location, website, and favorite genres.
- **Nuanced 0.5–5.0 Star Rating Engine**: Half-star precision rating widget with interactive hover preview, 10-tier percentage distribution bar chart, score count breakdowns, and instant community average recalculation.
- **Resilient Content & Auth Architecture**: Extended access token TTL to 365 days, dynamic API client origin resolution, auto-retry on 401, multi-criteria content lookup (ObjectId, slug, title), and complete elimination of hydration errors.