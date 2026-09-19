# LastPage

**LastPage** is a luxury editorial journal and social discovery platform for films and books. Inspired by the aesthetics of Linear, A24, and Letterboxd, LastPage gives cinephiles and bibliophiles an elevated, distraction-free space to track what they've finished, rate and review with nuance, discover peers, and curate their personal cultural archive.

---

## Current Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) · React · Tailwind CSS · Lucide React |
| Typography | Playfair Display (editorial serif) · Inter (sans-serif) · Monospace stats |
| Design System | Bespoke Dark Graphite Palette (`#121216` base, `#1C1C22` surfaces, Ember `#E8553D` & Gold `#FBBF24` accents) |
| Backend | Node.js · Express.js · REST API |
| Database | MongoDB Atlas · Mongoose ODM |
| Authentication | JWT Access + Rotating Refresh Tokens · bcryptjs password hashing · Offline fallback |
| Validation | Zod schema validation |
| Deployment | Vercel (Frontend & Backend serverless deployment) |

---

## Monorepo Layout

```
LastPage/
├── frontend/                     # Next.js 15 web application (port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx          # Single-viewport editorial landing page
│   │   │   ├── hub/              # Atmosphere portal gateway (Cinema vs Library)
│   │   │   ├── movies/           # Cinema journal & item detail pages
│   │   │   ├── books/            # Library journal & item detail pages
│   │   │   ├── activity/         # Dual-feed cultural activity stream (Friends & Personal)
│   │   │   ├── profile/          # User profile, Bento stats, & Find Friends search
│   │   │   ├── user/[username]/  # Public peer taste profiles & archives
│   │   │   ├── watchlist/        # Cinema watchlist
│   │   │   ├── reading-list/     # Books reading list
│   │   │   ├── favourites/       # Unified favourites collection
│   │   │   ├── liked/            # Liked media collection
│   │   │   ├── login/            # Dedicated auth page
│   │   │   ├── register/         # Register route (redirects to auth)
│   │   │   ├── browse.jsx        # Unified media browse & search engine
│   │   │   ├── detail.jsx        # Unified item detail & rating/logging engine
│   │   │   ├── globals.css       # Design tokens, base resets, scrollbar styling
│   │   │   └── layout.jsx        # RootLayout with fonts & sticky navigation
│   │   ├── components/           # Reusable UI components
│   │   │   ├── AuthCard.jsx      # Streamlined authentication & account management card
│   │   │   ├── ContentCard.jsx   # Editorial poster card with hover actions
│   │   │   ├── FollowModal.jsx   # Modal for followers & following with search filter
│   │   │   └── Nav.jsx           # Global sticky frosted-glass header
│   │   └── lib/                  # Client stores & API client
│   │       ├── activityStore.js  # Reactive client activity & logging storage
│   │       ├── api.js            # Fetch wrapper with JWT interceptors
│   │       ├── curatedCatalogue.js # High-resolution curated cinema & literature catalogue
│   │       └── socialStore.js    # Social graph layer, peer profiles, & user search
├── backend/                      # Express.js REST API (port 4000)
│   ├── src/
│   │   ├── db/                   # MongoDB connection management
│   │   ├── models/               # Mongoose schemas (User, Content, Review, Follow, etc.)
│   │   ├── routes/               # API endpoints (auth, content, social, library, discovery)
│   │   ├── middleware/           # JWT auth, validation, security
│   │   └── seed.js               # Database seeding script
├── docs/                         # Deployment & architectural documentation
├── REQUIREMENTS.md               # Product requirements & acceptance criteria
└── WORKFLOW.md                   # User journeys & system workflows
```

---

## Visual Design & Architecture

- **Luxury Dark Editorial Aesthetic**: Warm, dark graphite canvas (`#121216`) with elevated card surfaces (`#1C1C22`), crisp zinc typography, and subtle border definitions (`border-white/[0.08]`).
- **Single-Viewport Landing Page (`/`)**: Strictly non-scrollable (`h-screen overflow-hidden`), featuring an editorial hero statement on the left and a streamlined authentication card on the right.
- **Atmospheric Portal Gateway (`/hub`)**: Two prominent photographic portal cards leading to **Cinema** (`/movies`) and **Library** (`/books`).
- **Unified Media Catalogs (`/movies`, `/books`)**: Fast client search, Grid/List view switching, and category tabs (Watched/Read, Watchlist, Favourites, Liked, Section Activity).
- **Social Graph & Profile (`/profile`)**:
  - Dynamic profile header with clickable **Following** and **Followers** counters.
  - Interactive **Following/Followers Modal** with real-time account search filtering.
  - **Find Friends Search**: Live search input capsule in the profile section to discover peer curators by name, username, or bio keyword, with instant Follow/Following toggle actions.
- **Public Peer Taste Profiles (`/user/[username]`)**: Explore friends' logged works, star ratings, reviews, favourite films, and personal activity feeds.
- **Cultural Activity Stream (`/activity`)**: Split timeline feed toggleable between **Friends Activity** and **Your Journal**, grouped by relative days (Today, Yesterday, Date), with likeable activity cards.
- **Media Detail Pages (`/movies/[id]`, `/books/[id]`)**: Interactive 5-star ratings, logging dates with inline editing, private marginalia notes, and public reviews.
- **Hydration-Safe Architecture**: Guarded client mounts and `suppressHydrationWarning` on forms and inputs to prevent browser autofill extension conflicts.

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB instance)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/lastpagedb
MONGODB_DB_NAME=lastpagedb
JWT_ACCESS_SECRET=your-random-32-char-access-secret
JWT_REFRESH_SECRET=your-random-32-char-refresh-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
CORS_ORIGINS=http://localhost:3000
```

Start the backend:
```bash
npm run dev   # Runs on http://localhost:4000
```

Seed initial catalog items:
```bash
npm run seed
```

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
| `/` | Single-viewport hero landing page & streamlined auth card |
| `/hub` | Atmospheric portal gateway to Cinema & Library |
| `/movies` | Cinema catalog, watchlist, favourites, and logged films |
| `/movies/[id]` | Film detail page with rating, logging date, marginalia, and reviews |
| `/books` | Library catalog, reading list, favourites, and logged books |
| `/books/[id]` | Book detail page with rating, reading status, notes, and reviews |
| `/activity` | Social activity timeline feed (Friends & Personal tabs) |
| `/profile` | User profile, bento stat cards, bio editor, and **Find Friends search** |
| `/user/[username]` | Public taste profile of peer curators with collection tabs |
| `/watchlist` | Dedicated cinema watchlist page |
| `/reading-list` | Dedicated book reading list page |
| `/favourites` | Unified favourites collection (Cinema & Library tabs) |
| `/liked` | Unified liked works collection |
| `/login` | Dedicated sign-in page with ambient glows |
| `/register` | Registration redirect to authentication flow |

---

## Deployment

LastPage is architected for zero-configuration serverless deployment on Vercel:
- **Frontend Project**: Rooted at `frontend/` deploying Next.js 15 App Router.
- **Backend Project**: Rooted at `backend/` deploying Express API endpoints.
- **Database**: MongoDB Atlas with connection pooling and warm connection reuse.

 
 # #   R e c e n t   U p d a t e s   ( V e r s i o n   2 . 5 ) 
 -   * * R e a l   C l o u d   P e r s i s t e n c e * * :   T r a n s i t i o n e d   u s e r   p r o f i l e s ,   j o u r n a l s ,   w a t c h l i s t s ,   a n d   a c t i v i t y   f e e d s   f r o m   l o c a l   s t o r a g e   t o   f u l l   M o n g o D B   p e r s i s t e n c e . 
 -   * * C r o s s - D e v i c e   S y n c * * :   A c t i v i t i e s   a n d   c o l l e c t i o n s   a r e   n o w   s t r i c t l y   s c o p e d   t o   a u t h e n t i c a t e d   u s e r   a c c o u n t s ,   e n s u r i n g   f l a w l e s s   s y n c   a c r o s s   d e v i c e s . 
 -   * * U I   P o l i s h * * :   A d d e d   m i s s i n g   C S S   a n i m a t i o n s   ( ` a n i m a t e - f a d e - i n ` ,   ` s h a d o w - l u x u r y ` ) ,   r e f i n e d   p r o f i l e   b e n t o   g r i d ,   a n d   i m p r o v e d   l o a d i n g   s k e l e t o n   s t a t e s . 
 -   * * I m p r o v e d   A P I   R e s i l i e n c e * * :   U p d a t e d   a u t h e n t i c a t i o n   f a l l b a c k   l o g i c   t o   p r e v e n t   t o k e n   r e t r y   l o o p s   a n d   e n s u r e   s t r i c t   i s o l a t i o n   b e t w e e n   u s e r s .  
 