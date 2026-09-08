# LastPage — User & System Workflow
Version 1.0 — MongoDB Atlas + Vercel

---

## 1. GLOBAL ENTRY
Landing → Browse Movies/Books → Sign Up / Sign In → Hub (choose section) → Movies or Books.
Guest users can browse, search, and view public detail pages. Authenticated users get full actions (rate, review, track, follow).

## 2. GLOBAL ACTION FLOW
User action → authentication check → authorization check → Zod validation → MongoDB write → aggregate counter update → activity entry (where applicable) → notification (where applicable) → updated state returned → frontend UI update.

## 3. MOVIE DISCOVERY
Movies page → Discover / Popular / Trending / Top Rated / New Releases / Genres → Search → Filters → Results → Movie Detail.

## 4. MOVIE DETAIL
Load provider metadata + community rating/count + current user state (watched, watchlist, rating, like, favorite) + reviews + similar movies.
Actions: Watched, Watchlist, Rate (0.5–5), Like, Favorite, Review, Add to List, Report.

## 5. MOVIE WATCHED
Detail → Mark Watched → validate → upsert status & watched date → optionally remove from Watchlist → create activity entry → update recommendation signal → refresh library → return updated state.

## 6. MOVIE WATCHLIST
Detail → Add to Watchlist → save status → appears in library Watchlist tab → later: Mark Watched or Remove → library updates.

## 7. RATING
Detail → select 0.5–5 stars → validate → upsert user/content rating → recalculate aggregate (average + count) → update recommendation signal → return user rating + aggregate.
Removing a rating deletes the record and recalculates.

## 8. LIKE
Detail or review → Like → create relationship if absent → increment count → optional activity/notification. Unlike removes the relationship. Like is independent of rating and favorite.

## 9. FAVORITE
Detail → Favorite → create relationship → increment count → appears in Favorites library tab. Unfavorite removes relationship. Independent of Like and Rating.

## 10. MOVIE REVIEW
Detail → Write Review → body + optional spoiler flag → validate → publish → create activity → notify eligible followers → review visible on detail page and profile.
Edit requires ownership and preserves original identity. Delete soft-deletes the record.

## 11. BOOK DISCOVERY
Books page → Discover / Popular / Trending / Top Rated / New Releases / Genres → Search → Filters → Results → Book Detail.

## 12. BOOK DETAIL
Load cover + metadata + authors + community rating + user state (want to read, reading, read, rating, like, favorite) + reviews + similar books.
Actions: Want to Read, Currently Reading, Read, Track Progress, Rate, Like, Favorite, Review, Add to Shelf, Report.

## 13. BOOK STATUS
Detail → Want to Read → library. Want to Read → Start Reading → Currently Reading (progress/page tracking) → Finish → Read → completion date recorded → activity created → recommendation signal updated.

## 14. BOOK SHELF
Profile → Shelves → Create Shelf → name / description / visibility → Add Books → reorder / remove → save.
Public shelves are shareable. Private shelves enforce authorization at API level.

## 15. GLOBAL SEARCH
Search bar → All / Movies / Books filter → query → debounced API request → paginated results → filter/sort → select → detail page → action.

## 16. PROFILE
Profile page → privacy-safe display of: identity, stats, favorites, reviews, ratings, recent activity, lists, shelves, followers/following count.
If account is private, viewer/privacy relationship is checked before any data is returned.

## 17. FOLLOW
Profile → Follow → validate target (prevent self-follow) → create unique relationship → notify target → update follow counts.
Unfollow removes the relationship.

## 18. BLOCK
Profile → Block → store block relationship → remove/suppress mutual follow → suppress blocked content, activity, and notifications per policy.

## 19. ACTIVITY FEED
Eligible action (watched, read, rated, reviewed, favorited, list/shelf created) → create activity record → determine eligible viewers (followers) → apply privacy + block rules → serve newest-first paginated feed.

## 20. NOTIFICATIONS
Trigger event → check user notification preferences + privacy rules → create notification record → unread badge → Notifications page → mark read / mark all read.

## 21. REVIEW SOCIAL
Review → Like / Comment / Mention → privacy/block checks → notify relevant participants → moderation/report checks applied.

## 22. MOVIE LIST
Profile → Create List → name / description / visibility → add movies → reorder → remove → save.
Public lists have a shareable URL. Stable item positions are maintained.

## 23. LIBRARY
**Movies:** Watched, Watchlist, Favorites, Ratings, Reviews, Lists.
**Books:** Want to Read, Currently Reading, Read, Favorites, Ratings, Reviews, Shelves.
**Filters:** genre, year, rating, date added, watched/read date, author/director where applicable.

## 24. RECOMMENDATIONS
Signals: ratings + likes + favorites + history + genres + creators/authors + popularity + trending + recency → preference profile → candidate generation → exclude already-consumed/hidden → score → recommendation feed sections → new user action feeds back as signal.

## 25. MODERATION
User → Report target with reason → create report → moderation queue.
Moderator → inspect context/history → action: No Action / Warn / Hide / Delete / Suspend / Ban → write audit log → resolve → notify user if policy requires.

## 26. ADMIN
Admin Dashboard → Users / Content / Reports / Moderation / Taxonomy / Provider Sync / Analytics / Audit Logs / Settings.
Every privileged mutation checks role and writes an audit log entry.

## 27. AUTH FLOWS
- **Register:** validate inputs → check uniqueness → hash password → create User → issue access + refresh tokens → return user + tokens.
- **Login:** verify credentials → issue tokens.
- **Refresh:** validate refresh token hash → revoke old token → issue new token pair.
- **Logout:** revoke refresh token → clear client session.

## 28. API REQUEST LIFECYCLE
Browser → Vercel frontend → API route → security middleware (Helmet, CORS) → auth middleware → authorization → Zod validation → controller → Mongoose model → MongoDB Atlas → transformed response → frontend state update.

## 29. MONGODB CONNECTION (SERVERLESS)
Vercel function invoked → check cached Mongoose connection → reuse if warm (readyState === 1) → otherwise open new Atlas connection → execute query → retain connection for warm re-use.
Never create unnecessary connections per request.

## 30. CONTENT SYNC
Admin / scheduled job → provider API request → validate response → normalize to LastPage schema → upsert Content document → upsert People/Authors/Credits → store provider IDs/image URLs per licensing terms → update searchable fields → record sync result and any errors.

## 31. SECURITY MODEL
Protected mutation → auth check → authorization + ownership check → Zod validation → optional rate-limit check → mutation → audit log entry where required.
Public responses strip secrets and private fields and apply privacy/block rules.

## 32. ERROR HANDLING
Request → error thrown → central Express error handler → structured log with request ID → safe client-facing message → correct HTTP status code → no production stack traces or secrets leaked.

## 33. DEPLOYMENT PIPELINE
Git push → CI checks → Vercel build (frontend + backend separately) → Preview deployment → smoke test → promote to Production.
Frontend on Vercel + Backend on Vercel + MongoDB Atlas. All secrets in Vercel environment variables only.

## 34. RELEASE CHECKLIST
Configure env vars → Atlas IP access → MongoDB indexes → provider API keys → CORS origins → auth secrets → rate limits → privacy defaults → error monitoring → Atlas backups → build → automated tests → Preview smoke test → Production promotion.

## 35. PRIMARY USER JOURNEY
Landing → Sign Up → Hub (choose section) → Movies or Books → Discover / Search → Detail page → Watch/Read or Save → Rate → Like / Favorite → Write Review → Build List or Shelf → Profile / Library → Activity Feed → Follow Friends → Notifications → Recommendations → Discovery loop.

## 36. DEFINITION OF DONE
A feature is production-ready when:
- Responsive UI with loading, empty, and error states
- Input validation with Zod
- Authorization and privacy enforced at API level
- MongoDB indexes support all critical queries
- Duplicate relationships prevented by unique indexes
- Activity and notifications trigger correctly
- Errors are observable (logs + monitoring)
- Critical paths have tests
- No secrets exposed to the browser
- Feature works in Vercel Preview and Production
