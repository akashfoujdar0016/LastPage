# LASTPAGE — CINEMA & LITERATURE JOURNAL & SOCIAL GRAPH
## PRODUCTION REQUIREMENTS SPECIFICATION
**Version 2.5 — Next.js 15 · Tailwind CSS · Express · MongoDB Atlas · Vercel**

---

### 1. PRODUCT OVERVIEW
**LastPage** is an editorial personal diary and social discovery platform for films and books. Designed with a luxury dark aesthetic inspired by Linear, A24, and Letterboxd, LastPage allows users to log films and books, rate them with precision, save favourites, maintain watchlists and reading lists, follow peer curators, and explore friends' taste archives in a distraction-free environment.

---

### 2. PRODUCT GOALS
- **Dual Cultural Archive**: Provide dedicated yet unified journal experiences for Cinema (`/movies`) and Literature (`/books`).
- **Atmospheric Portal**: Seamless transition via `/hub` gateway between cinema and reading archives.
- **Precision Personal Tracking**: Log dates, 0.5–5 star ratings, likes, favourites, and private marginalia notes.
- **Social Graph & Discovery**:
  - Follow and unfollow peers with instant metric recalculation.
  - Clickable Followers and Following counts opening interactive inspection modals.
  - **Find Friends Search**: Live search bar in the user profile section to find curators by name, username, or bio keyword.
  - Public peer taste profiles (`/user/[username]`) showcasing logged works, star ratings, and review snippets.
- **Cultural Timeline Feed**: Dual-mode stream (`/activity`) separating friends' activity from personal logs, organized by relative days (Today, Yesterday, Date).
- **Luxury Editorial Aesthetics**: Elevated dark graphite canvas (`#121216`), card surfaces (`#1C1C22`), Playfair Display & Inter typography, and Ember/Gold accents.
- **Zero-Friction Resilience**: Hydration-safe form rendering, offline fallback capabilities, and sub-second page loads.

---

### 3. USER ROLES
- **Guest**: Browse public catalogs (`/movies`, `/books`), search titles, view public peer profiles (`/user/[username]`), and inspect item details.
- **Member (Authenticated Curator)**:
  - Log films as watched with custom dates.
  - Log books as read with custom dates.
  - Rate items from 0.5 to 5.0 stars with half-star visual precision.
  - Toggle Likes and Favourites independently.
  - Maintain personal Watchlists and Reading Lists.
  - Follow and unfollow peer accounts.
  - Search and discover friends from the Profile dashboard.
  - Like friends' activity entries.
  - Write reviews and marginalia reflections.
- **Admin**: Catalog management, taxonomy administration, moderation, and sync jobs.

---

### 4. CORE FUNCTIONAL DOMAINS

#### 4.1. Landing & Authentication
- **Strict Viewport Layout**: Enforced non-scrollable hero viewport (`h-screen overflow-hidden`) on desktop.
- **Symmetrical Two-Column Split**: Left column editorial brand statement + quick portal links; right column streamlined authentication card.
- **Hydration Protection**: Guarded client mounting and `suppressHydrationWarning` on all form inputs and buttons to eliminate autofill extension mismatches (`fdprocessedid`).
- **Inline Mode Switching**: Seamless toggle between Sign In and Create Account states with inline error feedback.

#### 4.2. Portal Gateway (`/hub`)
- Dominant, dual visual cards for **Cinema** and **Library**.
- Photographic backgrounds with subtle hover zooms and graphite vignette gradients.
- Direct entry points into `/movies` and `/books`.

#### 4.3. Cinema & Literature Catalogs (`/movies`, `/books`)
- Shared high-performance browsing engine ([`browse.jsx`](file:///e:/Projects/LastPage/frontend/src/app/browse.jsx)).
- Real-time client-side search filtering by title, director/author, and genres.
- View mode switcher: **Grid View** (posters/jackets) vs. **List View** (compact tabular).
- Segmented sub-view tabs:
  - **Cinema**: Watched, Watchlist, Favourites, Liked, Section Activity.
  - **Library**: Books Read, Reading List, Favourites, Liked, Section Activity.
- Reactive updates triggered automatically upon user interactions.

#### 4.4. Item Detail Pages (`/movies/[id]`, `/books/[id]`)
- Shared detail presentation engine ([`detail.jsx`](file:///e:/Projects/LastPage/frontend/src/app/detail.jsx)).
- High-resolution artwork display (film poster or book cover with spine accent).
- Interactive 5-star rating widget with hover preview and rating persistence.
- Watch / Read logging button with inline date selector (`formatLogDate`).
- Quick-action buttons: Like, Favourite, Watchlist / Reading List.
- Private Marginalia notes and public community reviews.
- Curated catalogue fallbacks with MongoDB API synchronization.

#### 4.5. Social Graph & Profile Section (`/profile`)
- **Profile Header**: Avatar with initial, username handle, and editable personal bio.
- **Social Metrics**: Clickable `[X] Following` and `[Y] Followers` counters.
- **Modal Account Inspector ([`FollowModal.jsx`](file:///e:/Projects/LastPage/frontend/src/components/FollowModal.jsx))**:
  - Displays avatar, name, handle, and bio for followed accounts or followers.
  - Integrated search filter input to find specific accounts within the list.
  - One-click Follow / Following toggle buttons.
- **Find Friends Search Engine**:
  - Dedicated search bar in the profile section matching query text against username, display name, and bio keywords.
  - Real-time result grid displaying friend cards, bio kickers, logged count, follower count, and direct Follow toggle.
  - Clickable cards linking directly to the curator's public taste profile (`/user/[username]`).
- **Bento Stat Cards**: Total films watched and books read with custom accent icons.

#### 4.6. Peer Public Profiles (`/user/[username]`)
- Public showcase of peer curator taste profiles.
- Dynamic follow button (`Follow` vs `Following` with `Unfollow` hover state).
- Segmented media switcher (`All Media`, `Cinema`, `Library`).
- Tabbed collection views: `Watched / Read`, `Favourites`, `Likes`, `Watchlist / TBR`, and `Journal Activity`.
- Likeable friend activity feed with instant counter increments.

#### 4.7. Activity Stream (`/activity`)
- Split timeline view:
  - **Friends Activity**: Activity aggregated from all accounts the user follows, ordered newest-first.
  - **Your Journal**: Chronological history of the active user's personal logs, ratings, and favourites.
- Relative day grouping headers: `Today`, `Yesterday`, and specific formatted dates.
- Interactive activity liking with heart animations and persistent counts.

---

### 5. TECHNICAL ARCHITECTURE

#### 5.1. Design System & CSS
- **Framework**: Tailwind CSS v3 with CSS custom properties (`:root`).
- **Theme Tokens**:
  - `--page`: `#121216` (warm dark slate / graphite base canvas)
  - `--surface`: `#1C1C22` (elevated card surface)
  - `--surface-raised`: `#24242C` (hover & modal surface)
  - `--border`: `#2A2A36` (primary structural border)
  - `--border-hairline`: `rgba(255, 255, 255, 0.08)` (subtle division line)
  - `--ink`: `#F4F4F5` (crisp white typography)
  - `--ink-muted`: `#A1A1AA` (sub-copy & captions)
  - `--ember`: `#E8553D` / `--ember-vibrant`: `#F87171` (cinema accent)
  - `--gold`: `#FBBF24` (literature & star rating accent)
- **Utility Rules**: `.no-scrollbar` utility for horizontal tab bars.

#### 5.2. Data Persistence & State Architecture
- **Client Stores**:
  - `socialStore.js`: Peer user database (`PEER_USERS`), following/follower state in `localStorage`, user search engine (`searchUsers`), activity feeds, and follow actions.
  - `activityStore.js`: Reactive event-driven log storage with dispatch notifications (`window.dispatchEvent('activityUpdated')`).
  - `curatedCatalogue.js`: Verified initial dataset of films and books for instant client availability.
- **REST API Backend**: Express.js server providing JWT authentication, Content endpoints, and Social relations.
- **Database**: MongoDB Atlas with Mongoose ODM schemas.

---

### 6. ACCEPTANCE & VERIFICATION CRITERIA
- [x] All 14 application routes return HTTP 200 without console warnings or runtime errors.
- [x] Fixed single-viewport hero landing page (`/`) on desktop with symmetrical two-column layout.
- [x] Atmospheric `/hub` portal navigation between Cinema and Library.
- [x] Real-time search and filter capabilities in `/movies` and `/books`.
- [x] Dynamic Following and Followers modals with search filter input.
- [x] "Find Friends" search bar in `/profile` with live filtering and direct Follow actions.
- [x] Public curator profiles accessible at `/user/[username]` with complete collection tabs.
- [x] Dual-feed `/activity` stream with relative day headers and activity likes.
- [x] Zero hydration errors on client mounts across all browsers and extensions.
