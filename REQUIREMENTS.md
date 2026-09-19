# LASTPAGE — CINEMA & LITERATURE JOURNAL & SOCIAL GRAPH
## PRODUCTION REQUIREMENTS SPECIFICATION
**Version 3.0 — Next.js 15 · Tailwind CSS · Express · MongoDB Atlas · Vercel**

---

### 1. PRODUCT OVERVIEW
**LastPage** is a luxury editorial journal and social discovery platform for films and books. Inspired by the aesthetics of Linear, A24, and Letterboxd, LastPage delivers a refined, distraction-free environment for cinephiles and bibliophiles to track finished media, rate and review with nuanced half-star precision, discover peers, and curate their personal cultural archive with complete cross-device cloud persistence.

---

### 2. CORE PRODUCT GOALS
- **Dual Cultural Archive**: Provide dedicated yet seamlessly integrated journal environments for Cinema (`/movies`) and Literature (`/books`).
- **Atmospheric Portal**: Intuitive gateway transitions via `/hub` connecting film and literature spaces.
- **Precision Personal Tracking**: Log completed dates, assign 0.5–5.0 star ratings with 10-tier breakdown distributions, toggle likes/favourites, and capture private marginalia reflections.
- **Complete Cloud Persistence & Cross-Device Synchronization**: Ensure all user journals, watchlists, reading lists, ratings, reviews, likes, favourites, and activities are backed by MongoDB Atlas and synchronized across mobile and desktop clients.
- **Social Graph & Discovery**:
  - Instant follow/unfollow capabilities with immediate count recalculation.
  - Interactive Following and Followers inspection modal with real-time text filtering.
  - **Find Friends Search Engine**: Live profile search bar matching curators by display name, username, or bio keywords.
  - Public peer taste profiles (`/user/[username]`) showcasing logged works, star ratings, and review snippets.
- **Cultural Activity Stream**: Split timeline stream (`/activity`) organizing peer logs versus personal activity into relative day groupings ("Today", "Yesterday", and formatted dates).
- **Luxury Editorial Aesthetics**: Elevated dark graphite canvas (`#121216`), card surfaces (`#1C1C22`), Playfair Display & Inter typography, and Ember/Gold accents.
- **Zero-Friction Resilience**: Hydration-safe form rendering, offline fallback capabilities, 365-day session durability, and sub-second page loads.

---

### 3. USER ROLES & ACCESS MATRIX

| Feature / Action | Guest (Unauthenticated) | Member (Authenticated) | Admin / Moderator |
|---|---|---|---|
| Browse Public Catalogs (`/movies`, `/books`) | Full Access | Full Access | Full Access |
| Search & Filter Media | Yes | Yes | Yes |
| Inspect Item Details & Reviews | Read-only | Full Interactive | Full Interactive |
| View Public Peer Profiles (`/user/[username]`) | Yes | Yes | Yes |
| Rate Content (0.5 – 5.0 Stars) | Fallback / Prompt | Cloud Persisted | Cloud Persisted |
| Log Status (Watched / Read) | Fallback / Prompt | Cloud Persisted | Cloud Persisted |
| Save to Watchlist / Reading List | Fallback / Prompt | Cloud Persisted | Cloud Persisted |
| Toggle Likes & Favourites | Fallback / Prompt | Cloud Persisted | Cloud Persisted |
| Submit Text Reviews & Marginalia | No | Yes | Yes |
| Customize Profile (Avatar, Bio, Genres, Links) | No | Yes | Yes |
| Follow / Unfollow Curators | No | Yes | Yes |
| Like Activity Stream Entries | No | Yes | Yes |
| Catalog Seeding & Content Moderation | No | No | Full Access |

---

### 4. CORE FUNCTIONAL DOMAINS

#### 4.1. Landing Page & Authentication
- **Strict Single-Viewport Layout**: Desktop hero section strictly constrained (`h-screen overflow-hidden`) without accidental window scrollbars.
- **Symmetrical Two-Column Split**: Left column editorial brand statement with quick hub links; right column streamlined authentication card.
- **Hydration Protection**: Guarded client mounting and `suppressHydrationWarning` on all form inputs and buttons to eliminate autofill extension conflicts.
- **Session Durability**: 365-day access token TTL preventing unexpected logouts across devices, with automated refresh token rotation and client interceptor retry.

#### 4.2. Portal Gateway (`/hub`)
- Dominant, dual photographic portal cards for **Cinema** (`/movies`) and **Library** (`/books`).
- Atmospheric hover zoom effects with graphite vignette gradients and instant route transitions.

#### 4.3. Curated Media Catalogs (`/movies`, `/books`)
- **84 Authentic Curated Works**: 52 landmark movies and 32 iconic books with verified high-resolution artwork, directors, authors, runtimes, page counts, and genres.
- **Search & Filter Engine**: Real-time client-side search filtering by title, creator, and genre tags.
- **View Mode Switcher**: Seamless toggle between **Grid View** (posters/jackets) and **List View** (compact tabular rows).
- **Segmented Sub-View Tabs**:
  - Cinema: Watched, Watchlist, Favourites, Liked, Section Activity.
  - Library: Books Read, Reading List, Favourites, Liked, Section Activity.

#### 4.4. Item Detail Pages (`/movies/[id]`, `/books/[id]`)
- **Shared Detail Presentation Engine** ([`detail.jsx`](file:///e:/Projects/LastPage/frontend/src/app/detail.jsx)).
- **Nuanced 0.5–5.0 Star Rating Widget**: Half-star visual precision with hover score preview, 10-tier percentage distribution bar chart, score counts, and instant average rating recalculation.
- **Watch / Read Logging**: One-click logging button with custom date tracking and inline date editor (`formatLogDate`).
- **Quick Action Bar**: Instant toggle for Like, Favourite, and Watchlist / Reading List.
- **Community Reviews & Marginalia**:
  - Public text reviews with rating, title, and spoiler warning toggles.
  - Private marginalia notes for personal curator reflections.
- **Resilient Content Resolution**: Resolves items by MongoDB ObjectId, canonical slug, or sanitized title with fallback to seed data.

#### 4.5. Profile Management & Customization (`/profile`)
- **Profile Header**: Avatar image (custom URL, upload, or monogram fallback), handle, display name, bio, location, and website links.
- **Edit Profile Modal** ([`EditProfileModal.jsx`](file:///e:/Projects/LastPage/frontend/src/components/EditProfileModal.jsx)):
  - Custom image avatar URL input with real-time preview, preset selection, or file upload.
  - Form fields for display name, bio, location, and personal website.
  - Multi-select favorite genre pill selector.
- **Social Counters**: Clickable `[X] Following` and `[Y] Followers` counters triggering account inspection modal.
- **Find Friends Search Engine**: Live search bar querying user database by display name, username, or bio keywords with instant Follow/Unfollow toggle and direct taste profile link.
- **Bento Stat Cards**: Total films watched, books read, reviews written, ratings logged, and favorite genre pills.
- **Tabbed Personal Archive**: Logged Films, Logged Books, Reviews, Ratings, Lists, and Activity feeds.

#### 4.6. Peer Public Profiles (`/user/[username]`)
- Public curator showcase displaying peer avatar, bio, location, website, and social counters.
- Dynamic `Follow` / `Following` button with red hover `Unfollow` indicator.
- Segmented media switcher (`All Media`, `Cinema`, `Library`).
- Tabbed collection views: `Watched / Read`, `Favourites`, `Likes`, `Watchlist / TBR`, and `Journal Activity`.

#### 4.7. Cultural Activity Stream (`/activity`)
- Split timeline view toggleable between **Friends Activity** (peer feed) and **Your Journal** (personal activity log).
- Relative day grouping headers: `Today`, `Yesterday`, and specific formatted dates (`MMM DD, YYYY`).
- Interactive activity liking with persistent counters and heart animations.

#### 4.8. Dedicated Collection Pages
- Unified collection engine via `CollectionLayout.jsx`:
  - `/watchlist`: Cinema watchlist queue.
  - `/reading-list`: Literature reading list queue.
  - `/favourites` & `/favorites`: Curated all-time favourite films and books with dual-mode category switcher.
  - `/liked`: Liked films and books.
- Real-time cloud + local merge ensuring instant updates on cross-device actions.

---

### 5. TECHNICAL ARCHITECTURE

#### 5.1. Design System & CSS
- **Framework**: Tailwind CSS v3 with CSS custom properties (`:root`).
- **Theme Tokens**:
  - `--page`: `#121216` (warm dark graphite base canvas)
  - `--surface`: `#1C1C22` (elevated card surface)
  - `--surface-raised`: `#24242C` (hover & modal surface)
  - `--border`: `#2A2A36` (primary structural border)
  - `--border-hairline`: `rgba(255, 255, 255, 0.08)` (subtle division line)
  - `--ink`: `#F4F4F5` (crisp white typography)
  - `--ink-muted`: `#A1A1AA` (sub-copy & captions)
  - `--ember`: `#E8553D` / `--ember-vibrant`: `#F87171` (cinema accent)
  - `--gold`: `#FBBF24` (literature & star rating accent)
- **Animations**: `animate-fade-in`, `animate-slide-up`, `shadow-luxury`, and custom `.no-scrollbar` utility.

#### 5.2. Data Persistence & State Architecture
- **Mongoose Models (16 Schemas)**:
  - `User`, `Content`, `Rating`, `Review`, `ReviewLike`, `Comment`, `Like`, `Favorite`, `Status`, `Follow`, `List`, `ListItem`, `Activity`, `Notification`, `Report`, `RefreshToken`.
- **API Endpoints**:
  - `/api/auth`: Register, login, refresh, me, profile update.
  - `/api/content`: List/search, single item, status, rating, like, favorite, reviews, seed.
  - `/api/library`: User journal (`/me/library`), activity (`/me/activity`), reviews (`/me/reviews`), custom lists.
  - `/api/social`: Follow/unfollow, followers, following, user profile, public collections, review likes, comments, reports.
  - `/api/discovery`: Curated home spotlight, trending, top-rated, recommendations.
- **Client Synchronization**:
  - Dynamic API client with automatic URL resolution (`localhost:4000` vs `/api`).
  - Reactive custom events (`activityUpdated`, `socialUpdated`) for instant UI re-rendering.
  - Resilient local storage caching paired with MongoDB Atlas cloud synchronization.

---

### 6. ACCEPTANCE & VERIFICATION CRITERIA

- [x] All 16 application routes return HTTP 200 without console errors or layout shifts.
- [x] Single-viewport hero landing page (`/`) on desktop with symmetrical editorial split.
- [x] Atmospheric `/hub` portal navigation between Cinema and Library.
- [x] 84 authentic catalog items (52 films and 32 books) loaded with high-res artwork and complete metadata.
- [x] Nuanced 0.5 to 5.0 star rating widget with 10-tier percentage breakdown and score counts.
- [x] Full cloud persistence for watch/read status, ratings, reviews, likes, and favourites in MongoDB Atlas.
- [x] Complete profile customization via `EditProfileModal` (avatar URL/upload, bio, location, website, favorite genres).
- [x] Live "Find Friends" search bar in `/profile` with real-time filtering and direct follow actions.
- [x] Following and Followers inspection modal with interactive account search filter.
- [x] Public curator profiles accessible at `/user/[username]` with complete collection tabs.
- [x] Dual-mode `/activity` stream with relative day headers and activity likes.
- [x] Zero hydration errors across client mounts, forms, and browser extensions.
