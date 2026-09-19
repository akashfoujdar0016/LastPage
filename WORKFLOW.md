# LastPage — User & System Workflow Specification
**Version 3.0 — Production Reference · Next.js 15 · Tailwind CSS · MongoDB Atlas · Vercel**

---

## 1. GLOBAL ENTRY & PORTAL GATEWAY

```
Landing Page (/) [Single Viewport Hero]
  ├── Left Column: Brand Statement + Direct Gateways ("Cinema" & "Library")
  └── Right Column: AuthCard (Sign In / Create Account)
        │
        ▼ (On Successful Auth / Exploration)
  Atmospheric Portal (/hub)
        ├── [Cinema Portal Card]  ──>  Cinema Journal (/movies)
        └── [Library Portal Card] ──>  Library Journal (/books)
```

1. **Guest vs Authenticated Access**:
   - Guests can explore Cinema (`/movies`) and Library (`/books`), search titles, open item details, and view public curator profiles (`/user/[username]`).
   - Authenticated members get full logging, 0.5–5.0 star rating, profile editing, social graph, and cloud synchronization capabilities.
2. **Session Persistence**:
   - Authentication tokens are stored in `localStorage` (`accessToken`, `currentUser`).
   - Access tokens have a 365-day TTL to ensure durable cross-device sessions without premature logouts.
   - The fetch wrapper (`api.js`) automatically retries requests on 401 with stored credentials.
   - A `mounted` guard in client components ensures that initial server rendering reconciles seamlessly with local browser state without hydration mismatches.

---

## 2. PROFILE CUSTOMIZATION & SOCIAL GRAPH WORKFLOWS

### 2.1. Profile Customization via EditProfileModal

```
User visits /profile ──> Clicks [Edit Profile] Button
  │
  ▼
EditProfileModal Opens
  ├── Avatar Customization:
  │     ├── Custom Image URL input with real-time preview
  │     ├── Monogram initial generator fallback
  │     └── File upload option
  ├── Personal Details:
  │     ├── Display Name input (max 80 chars)
  │     ├── Bio textarea with live character counter (max 300 chars)
  │     ├── Location input (e.g. "Tokyo, Japan")
  │     └── Website URL input (e.g. "https://letterboxd.com/user")
  ├── Favorite Genres Selector:
  │     └── Interactive clickable genre tags (Cinema & Literature tags)
  │
  ▼ User clicks [Save Changes]
  ├── Calls PATCH /api/auth/me with update payload
  ├── Updates MongoDB User document
  ├── Synchronizes localStorage currentUser
  └── Dispatches 'userUpdated' & updates global navigation avatar
```

### 2.2. Find Friends Search (Profile Section)

```
User visits /profile
  │
  ▼
Find Friends Section
  ├── Inset Search Capsule ("Search friends by name or @…")
  │     │
  │     ├── Type query (e.g., "Elena", "Marcus", "critic")
  │     │     ▼
  │     └── socialStore.searchUsers(query, currentUsername)
  │           │
  │           ▼
  └── Instant Results Grid
        ├── Avatar with user image or initial
        ├── Display Name & @username handle
        ├── Bio snippet & logged works / follower count
        ├── Direct [Follow] / [Following] toggle button
        │     └── Updates MongoDB /api/social/users/:id/follow & dispatches 'socialUpdated'
        └── Clickable Card ──> Navigates to Peer Taste Profile (/user/[username])
```

- **Empty Query State**: Displays curated peer curators as suggested accounts to follow.
- **Active Search State**: Filters in real-time across display names, usernames, and bio descriptions.
- **Immediate Follow/Unfollow**: Toggling follow status updates the user's Following count instantly and broadcasts a `socialUpdated` event to refresh all feeds.

### 2.3. Following & Followers Modal Workflow

```
Profile Header (/profile or /user/[username])
  ├── Click [X] Following or [Y] Followers
  │
  ▼
FollowModal Opens
  ├── Modal Header with total account count
  ├── Modal Search Filter Input ("Search following…" / "Search followers…")
  │     └── Filters listed accounts dynamically as the user types
  ├── Account List:
  │     ├── Peer avatar & display name
  │     ├── Bio snippet & handle
  │     ├── Link to public taste profile (/user/[username])
  │     └── Dynamic Follow / Following toggle button (with red "Unfollow" hover indicator)
  └── Close via (X) button, backdrop click, or profile navigation
```

### 2.4. Peer Taste Profile Exploration (`/user/[username]`)

```
Navigate to /user/[username]
  │
  ├── Profile Header:
  │     ├── Peer avatar, display name, handle, bio, location, and website
  │     ├── Social counters ([X] Following, [Y] Followers, [Z] Reviews)
  │     └── Dynamic [Follow] / [Following] button
  │
  ├── Media Switcher (All Media | Cinema | Library)
  │
  └── Collection Tabs:
        ├── Watched / Read: Grid of posters/covers with user's star rating & log date
        ├── Favourites: Curated all-time favourite films & books
        ├── Likes: Liked media items
        ├── Watchlist / TBR: Peer's planned queue
        └── Journal Activity: Public activity cards with review snippets & like buttons
```

---

## 3. MEDIA LOGGING, RATING & REVIEWING WORKFLOWS

### 3.1. Item Detail & Action Cycle (`/movies/[id]`, `/books/[id]`)

```
Open Media Detail Page
  │
  ├── 1. Artwork & Meta:
  │     └── High-res poster/jacket, director/author, genres, year, runtime/pages, synopsis
  │
  ├── 2. Nuanced Star Rating Widget (0.5 – 5.0 Stars):
  │     ├── Hover previews half-star score with precise visual fill
  │     ├── Click calls POST /api/content/:id/rating
  │     ├── Automatically recalibrates community average & 10-tier breakdown percentages
  │     └── Auto-logs item status to WATCHED / READ if not already recorded
  │
  ├── 3. Status Action (Watched / Read):
  │     ├── Click [Mark as Watched] / [Mark as Read]
  │     ├── Automatically records current date (or opens date picker)
  │     └── Inline date edit via "formatLogDate"
  │
  ├── 4. Fast Interactions:
  │     ├── [Like] toggle (heart icon) ──> POST /api/content/:id/like
  │     ├── [Favourite] toggle (gold star icon) ──> POST /api/content/:id/favorite
  │     └── [Watchlist / Reading List] toggle ──> POST /api/content/:id/status
  │
  └── 5. Marginalia & Community Reviews:
        ├── Private notes textarea (stored for personal curator reflection)
        └── Public text review form:
              ├── Title input (optional)
              ├── Body textarea (1–10,000 chars)
              ├── Rating attachment
              ├── Spoiler warning toggle
              └── Submit ──> POST /api/content/:id/reviews ──> Emitted to activity feed
```

---

## 4. CROSS-DEVICE CLOUD SYNCHRONIZATION ARCHITECTURE

```
Client Mount (Mobile or Laptop)
  │
  ├── 1. Initialize API Client:
  │     └── Resolves base URL dynamically (localhost:4000 in dev, /api in prod)
  │
  ├── 2. Check Session & Auth:
  │     ├── Validates stored accessToken
  │     └── Fetches authenticated profile via GET /api/auth/me
  │
  ├── 3. Synchronize Cloud Journal:
  │     ├── Calls GET /api/me/library
  │     │     ├── Returns watched, watchlist, favorites, likes, ratings, reviews
  │     │     └── Resolves MongoDB content references via lean populate & ID fallback
  │     └── Reconciles cloud data with local browser caches seamlessly
  │
  ├── 4. Synchronize Activity Timeline:
  │     └── Calls GET /api/me/activity
  │           └── Populates personal journal history with enriched media metadata
  │
  └── 5. Event-Driven Reactivity:
        ├── Content action fires 'activityUpdated' or 'socialUpdated'
        ├── CollectionLayout, Nav, and Profile listeners re-fetch or re-render immediately
        └── All devices stay in lockstep without stale state
```

---

## 5. CULTURAL ACTIVITY STREAM WORKFLOW (`/activity`)

```
Navigate to /activity
  │
  ├── Stream Mode Switcher:
  │     ├── [Friends Activity] ──> Aggregated from peer accounts followed by the user
  │     └── [Your Journal]    ──> Cloud history of personal logs, ratings, and reviews
  │
  ├── Category Filter: [All] | [Cinema] | [Library]
  │
  └── Grouped Timeline Render:
        ├── "Today" header
        ├── "Yesterday" header
        ├── "Mon DD, YYYY" headers
        │
        └── Activity Card:
              ├── User avatar, handle, and action label (rated, reviewed, watched, read, favorited)
              ├── Media title, poster thumbnail, and creator name
              ├── Star rating badge (★ X.X) & review quote snippet
              └── Like Button:
                    ├── Heart icon with active like counter
                    └── Click toggles like in socialStore/API & dispatches 'socialUpdated'
```

---

## 6. CURATED MEDIA BROWSING & COLLECTION WORKFLOWS

### 6.1. Media Browse Engines (`/movies`, `/books`)

```
Navigate to /movies or /books
  │
  ├── Top Navigation & Search:
  │     ├── Inset Search Capsule: Real-time search across title, creator, and genres
  │     └── View Mode Toggle: [Grid View] (posters) vs [List View] (compact rows)
  │
  ├── Sub-View Segmented Pills:
  │     ├── Cinema: Watched | Watchlist | Favourites | Liked | Section Activity
  │     └── Library: Books Read | Reading List | Favourites | Liked | Section Activity
  │
  └── Content Card:
        ├── Poster with aspect-[2/3] ratio and subtle border
        ├── Hover Action Capsule: Quick Like, Favourite, and "View ↗" pill
        ├── Title & creator link
        └── Rating badge & logged date indicator
```

### 6.2. Dedicated Collections (`/watchlist`, `/reading-list`, `/favourites`, `/liked`)

- Handled by the unified, responsive `CollectionLayout.jsx` component.
- Supports dual-mode category switching (Films vs Books) with item counts in button badges.
- Automatically merges cloud-synced items from `/api/me/library` with local client state.
- Empty states feature curated editorial messages and one-click CTA buttons linking directly to `/movies` or `/books`.

---

## 7. CLIENT HYDRATION & EXTENSION COMPATIBILITY LIFECYCLE

```
Server (SSR)
  └── Renders minimal clean HTML shell with suppressHydrationWarning
        │
        ▼
Browser DOM Loading
  └── Third-party autofill / password extensions inject attributes (e.g. fdprocessedid)
        │
        ▼
React Hydration
  ├── suppressHydrationWarning on <html>, <body>, and <input> elements
  │     └── Suppresses attribute mismatch warnings
  └── Component mounted guards:
        ├── Before mount: renders stable layout container
        └── After useEffect (mounted = true): renders interactive form inputs & auth status
              └── React hydrates cleanly with 0 console warnings or error overlays
```

---

## 8. PRIMARY CURATOR JOURNEY (END-TO-END)

1. **Enter & Authenticate**: Single-viewport landing page (`/`) → Enter credentials or explore as guest → Arrive at atmospheric Hub (`/hub`).
2. **Choose Realm**: Select **Cinema** (`/movies`) or **Library** (`/books`).
3. **Discover & Inspect**: Browse 84 authentic curated works → Use instant search bar → Click poster to open Detail view.
4. **Log & Reflect**: Select nuanced star rating (0.5–5.0) → Click "Mark as Watched/Read" → Add review snippet or private marginalia.
5. **Cloud Persistence**: Interaction is persisted to MongoDB Atlas via REST API and automatically synchronized across all user devices.
6. **Feed Emission**: Logged item is recorded in user's journal and emitted to followers' activity feeds.
7. **Connect with Peers**: Open `/profile` → Use **Find Friends** search bar → Search and follow peer curators → Inspect peer taste profiles at `/user/[username]`.
8. **Profile Customization**: Click [Edit Profile] → Upload or link custom avatar image → Update bio, location, website, and favorite genres.
9. **Social Timeline**: Open `/activity` → View friends' logs, ratings, and reviews → Like friend activities → Continuous cultural discovery loop.
