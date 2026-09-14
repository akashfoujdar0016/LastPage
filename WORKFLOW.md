# LastPage — User & System Workflow Specification
**Version 2.5 — Production Reference · Next.js 15 · Tailwind CSS · MongoDB Atlas · Vercel**

---

## 1. GLOBAL ENTRY & PORTAL GATEWAY

```
Landing Page (/) [Single Viewport]
  ├── Left: Brand Statement + Direct Gateways ("Cinema" & "Library")
  └── Right: AuthCard (Sign In / Create Account)
        │
        ▼
  Atmospheric Portal (/hub)
        ├── [Cinema Portal Card]  ──>  Cinema Journal (/movies)
        └── [Library Portal Card] ──>  Library Journal (/books)
```

1. **Guest or Authenticated Access**:
   - Guests can explore Cinema (`/movies`) and Library (`/books`), search titles, open item details, and view public curator profiles (`/user/[username]`).
   - Authenticated members get full logging, rating, social graph, and timeline capabilities.
2. **Session Persistence**:
   - Authentication tokens are stored in `localStorage` (`accessToken`, `currentUser`).
   - A `mounted` guard in client components ensures that initial server rendering reconciles seamlessly with local browser state without hydration mismatches.

---

## 2. SOCIAL GRAPH & FRIEND DISCOVERY WORKFLOWS

### 2.1. Find Friends Search (Profile Section)

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
        ├── Avatar with user initial
        ├── Display Name & @username handle
        ├── Bio snippet & logged works / follower count
        ├── Direct [Follow] / [Following] toggle button
        │     └── Updates localStorage & fires 'socialUpdated' event
        └── Clickable Card ──> Navigates to Peer Taste Profile (/user/[username])
```

- **Empty Query State**: Displays curated peer accounts (`PEER_USERS`) as suggested curators to follow.
- **Active Search State**: Filters in real-time across display names, usernames, and bio descriptions.
- **Immediate Follow/Unfollow**: Toggling follow status updates the user's Following count instantly and broadcasts a `socialUpdated` event to refresh all feeds.

### 2.2. Following & Followers Modal Workflow

```
Profile Header (/profile or /user/[username])
  ├── Click [X] Following or [Y] Followers
  │
  ▼
FollowModal Opens
  ├── Modal Header with account count
  ├── Modal Search Filter Input ("Search following…" / "Search followers…")
  │     └── Filters listed accounts as the user types
  ├── Account List:
  │     ├── Peer avatar & display name
  │     ├── Bio snippet
  │     ├── Link to public taste profile (/user/[username])
  │     └── Dynamic Follow / Following toggle button (with red "Unfollow" hover indicator)
  └── Close via (X) button, backdrop click, or profile navigation
```

### 2.3. Peer Taste Profile Exploration (`/user/[username]`)

```
Navigate to /user/[username]
  │
  ├── Profile Header:
  │     ├── Peer identity, bio, and social counters
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

## 3. MEDIA LOGGING & DETAIL PAGE WORKFLOWS

### 3.1. Item Detail & Action Cycle (`/movies/[id]`, `/books/[id]`)

```
Open Media Detail Page
  │
  ├── 1. Artwork & Meta: Poster/jacket, director/author, genres, synopsis
  │
  ├── 2. Star Rating (0.5 – 5.0 Stars):
  │     ├── Hover previews star score with visual precision
  │     ├── Click sets rating in localStorage & fires 'activityUpdated'
  │     └── Updates average community rating
  │
  ├── 3. Status Action (Watched / Read):
  │     ├── Click [Mark as Watched] / [Mark as Read]
  │     ├── Automatically records current date (or opens date picker)
  │     └── Optional inline date edit via "formatLogDate"
  │
  ├── 4. Fast Interactions:
  │     ├── [Like] toggle (heart icon)
  │     ├── [Favourite] toggle (gold star icon)
  │     └── [Watchlist / Reading List] toggle
  │
  └── 5. Marginalia & Community Reviews:
        ├── Private notes input (saved locally for personal reference)
        └── Public text review submission with optional rating
```

---

## 4. CULTURAL ACTIVITY STREAM WORKFLOW (`/activity`)

```
Navigate to /activity
  │
  ├── Stream Mode Switcher:
  │     ├── [Friends Activity] ──> Filtered to peers in user's following list
  │     └── [Your Journal]    ──> Personal chronological log history
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
                    └── Click toggles like in socialStore & dispatches 'socialUpdated'
```

---

## 5. BROWSE & SEARCH ENGINES (`/movies`, `/books`)

```
Navigate to /movies or /books
  │
  ├── Top Navigation & Search:
  │     ├── Inset Search Capsule: Searches title, director/author, and genres
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

---

## 6. CLIENT HYDRATION & EXTENSION COMPATIBILITY LIFECYCLE

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
  └── AuthCard mounted guard:
        ├── Before mount: renders stable layout container
        └── After useEffect (mounted = true): renders interactive form inputs
              └── React hydrates cleanly with 0 console warnings or error overlays
```

---

## 7. PRIMARY CURATOR JOURNEY (END-TO-END)

1. **Enter & Authenticate**: Single-viewport landing page (`/`) → Enter credentials or explore as guest → Arrive at atmospheric Hub (`/hub`).
2. **Choose Realm**: Select **Cinema** (`/movies`) or **Library** (`/books`).
3. **Discover & Inspect**: Browse curated works → Use instant search bar → Click poster to open Detail view.
4. **Log & Reflect**: Set star rating (0.5–5) → Click "Mark as Watched/Read" → Add review snippet or private marginalia.
5. **Feed Emission**: Logged item is recorded in `activityStore` → Emitted to personal timeline and followers' feeds.
6. **Connect with Peers**: Open `/profile` → Use **Find Friends** search bar → Search and follow peer curators → Inspect peer taste profiles at `/user/[username]`.
7. **Social Timeline**: Open `/activity` → View friends' logs, ratings, and reviews → Like friend activities → Continuous cultural discovery loop.
