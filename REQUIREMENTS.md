CINEFOLIO — MOVIE + BOOK SOCIAL PLATFORM
PRODUCTION REQUIREMENTS
Version 2.0 — MongoDB Atlas + Vercel

1. PRODUCT OVERVIEW
Cinefolio is a unified social discovery and personal-tracking platform for movies and books. Movies and Books have separate discovery experiences while sharing profiles, reviews, ratings, follows, activity, notifications and social features.

2. PRODUCT GOALS
- Discover movies and books.
- Track personal consumption.
- Rate and review content.
- Like and favorite independently.
- Build movie watchlists and custom lists.
- Build book reading statuses and custom shelves.
- Follow users and consume an activity feed.
- Receive social notifications.
- Discover personalized recommendations.
- Provide professional, responsive, accessible UI.
- Support safe moderation, privacy and scalable infrastructure.

3. USER ROLES
Guest: browse public catalog, search, view public profiles/reviews/lists/shelves.
Member: track, rate, review, like, favorite, follow, comment, create lists/shelves, manage privacy, report.
Moderator: review reports, moderate violating content, maintain audit trail.
Admin: manage users, catalog, taxonomy, integrations, moderation, analytics and settings.

4. MOVIE FEATURES
Discover, Popular, Trending, Top Rated, New Releases, Genres, Search, Filters, Detail, Watched, Watchlist, Favorites, Ratings, Reviews, Review Likes, Comments, Profiles, Activity, Notifications, Custom Lists, Recommendations, Reporting/Moderation.

5. BOOK FEATURES
Discover, Popular, Trending, Top Rated, New Releases, Genres, Search, Filters, Detail, Want to Read, Currently Reading, Read, Reading Progress, Favorites, Ratings, Reviews, Review Likes, Comments, Profiles, Activity, Notifications, Custom Shelves, Recommendations, Reporting/Moderation.

6. DETAIL PAGES
Movies display poster/backdrop, title, original title, release date/year, runtime, genres, synopsis, community rating/count, cast, crew/director, provider metadata, reviews and similar movies. Actions: Watched, Watchlist, Rate 0.5–5, Like, Favorite, Review, List, Report.
Books display cover, title/subtitle, authors, publication date, publisher, pages, ISBN, genres, language, synopsis, community rating/count, author information, reviews and similar books. Actions: Want to Read, Currently Reading, Read, Progress, Rate, Like, Favorite, Review, Shelf, Report.

7. RATINGS
- 0.5–5.0.
- One active rating per user/content.
- Change/remove supported.
- Average and count exposed.
- Rating independent from like, favorite and status.

8. STATUS
Movies: Watched, Watchlist.
Books: Want to Read, Currently Reading, Read, optional page/percentage progress, start/completion timestamps.
Status must not imply rating, like or favorite.

9. SOCIAL
Public/private profiles, follow/unfollow, block, optional mute, activity feed, review likes/comments, notifications, social privacy controls and activity visibility.

10. REVIEWS
Create/edit/delete text reviews, spoiler flag, review likes/comments, report, ownership enforcement, soft deletion where appropriate. Spoiler body remains hidden until explicitly revealed.

11. LISTS/SHELVES
Movies: custom lists with name, description, items, ordering, visibility and share URL.
Books: custom shelves with name, description, items, ordering, visibility and share URL.

12. SEARCH
Global All/Movies/Books search. Movies: title, original title, actor, director, genre, year. Books: title, author, ISBN, publisher, genre, year. Filters include genre, year, rating, popularity, date, movie runtime, book page count and language.

13. DISCOVERY & RECOMMENDATIONS
Popular, Trending, Top Rated, New Releases, genres, similar content and personalized recommendations. MVP uses ratings, likes, favorites, history, genres, creators/authors, popularity, trends and recency. Begin rule-based; add collaborative filtering later.

14. PROFILE/LIBRARY
Avatar, username, display name, bio, follower/following counts, movie/book stats, watched/read counts, average rating, favorites, reviews, ratings, activity, lists and shelves. Library supports status tabs and sorting/filtering.

15. NOTIFICATIONS
Follow, review like/comment, comment interaction, mention, list/shelf interaction, moderation and system notifications. Read/unread, mark read/all read and notification preferences.

16. MODERATION
Reports for users, content, reviews and comments; moderation queue; open/reviewing/resolved/rejected states; moderator notes; actions; audit trail; soft deletion/anonymization where appropriate.

17. PRIVACY
Profile, activity, followers/following, list/shelf, review/activity and notification preferences. Private resources must not leak through APIs, feeds, search or recommendations.

18. SECURITY
Secure auth; password hashing; access/refresh session security; HttpOnly secure cookies where applicable; CSRF protection for cookie mutations; validation; rate limiting; CORS; security headers; authorization/object-level access control; safe errors; audit logs; environment-managed secrets.

19. DATABASE — MONGODB ATLAS
Collections: users, contents, ratings, reviews, likes, favorites, statuses, follows, comments, lists, listItems, shelves, shelfItems, activities, notifications, reports, auditLogs.
Use compound unique indexes for user/content relationships and indexes for search, feeds, profiles and libraries. Reuse MongoDB connections in serverless execution.

20. CONTENT PROVIDERS
Use only authorized/licensed movie/book metadata sources. Implement provider adapters for search, details, images, people/authors, genres, similar content and synchronization. Keep provider API keys server-side.

21. MEDIA
Use object storage/CDN for avatars and large user/platform media rather than MongoDB documents.

22. FRONTEND
Next.js + JavaScript + Tailwind CSS + accessible components. Responsive desktop/mobile. Public SEO routes for movies/books/profiles/lists/shelves. Required routes include /, /movies, /movies/[slug], /books, /books/[slug], /search, /activity, /notifications, /library, /profile/[username], /lists/[slug], /shelves/[slug], /settings and /admin.

23. BACKEND
Node.js + JavaScript + REST API + MongoDB/Mongoose, modular controllers/services/repositories, Zod validation, auth/authorization middleware, centralized errors, structured logs, health/readiness and API versioning.

24. API AREAS
Auth, Users, Content, Search, Ratings, Reviews, Comments, Likes, Favorites, Status/Library, Follows, Activity, Notifications, Lists, Shelves, Recommendations, Reports, Moderation and Admin.

25. VERCEL
Frontend and backend can be deployed as two Vercel projects. Backend must be serverless-compatible and must not depend on persistent local filesystem. MongoDB Atlas provides persistence. Configure Preview/Production environment variables separately.
Required secrets/config: MONGODB_URI, MONGODB_DB, auth/session secret, APP_URL, CORS_ORIGIN, provider API keys and storage credentials where required.

26. OBSERVABILITY
Structured logs, request IDs, error tracking, health checks, performance/database monitoring, product metrics and moderation metrics.

27. PERFORMANCE
Pagination, indexes, connection reuse, safe caching, CDN images, lazy loading, no N+1 queries, denormalized counters where justified and background jobs for expensive operations.

28. ACCESSIBILITY
Semantic HTML, keyboard navigation, visible focus, sufficient contrast, alt text, reduced motion, accessible forms/errors and screen-reader friendly controls.

29. UI DIRECTION
Premium editorial, clean, minimal, poster/cover-first, strong typography, generous whitespace, subtle borders, restrained accent, light/dark themes. Desktop: top/left navigation, large grids, two-column details. Mobile: bottom navigation, responsive grids, compact/sticky actions and touch-friendly controls.

30. CORE BUSINESS RULES
Rating, Like, Favorite and Status are independent. One rating per user/content. Likes/favorites toggle. Reviews have one author/content item and preserve identity when edited. Spoilers are hidden until revealed. Privacy is enforced at API level. Deleted records use soft deletion/anonymization where needed. Aggregates expose average/count. Moderation is auditable. Third-party metadata must follow licensing/terms.

31. ACCEPTANCE CRITERIA
Register/login; search movies/books; open detail; independently rate/like/favorite; track movie/book status; create/edit/delete spoiler reviews; review likes/comments; follow users; eligible activity feed; public/private lists/shelves; notifications; privacy management; reporting; moderation; recommendations; secure authorization/privacy; successful Vercel + MongoDB Atlas deployment.

32. SUCCESS METRICS
Activation, tracked items/active user, review rate, search-to-action conversion, follow rate, recommendation engagement, list/shelf creation, 7/30-day retention, social engagement and report resolution time.

33. DEFINITION OF DONE
UI has loading/empty/error states; API validates inputs; authorization/privacy enforced; indexes support critical queries; duplicates prevented; activity/notifications correct; errors observable; tests cover critical behavior; no secrets in browser; feature works in Vercel preview and production.
