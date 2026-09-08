# Production Launch Checklist — LastPage

## P0 — Foundation (Complete ✓)

- [x] MongoDB Atlas data model with Mongoose ODM
- [x] JWT access + rotating refresh token auth architecture
- [x] Movie and book catalog (shared Content collection, type field)
- [x] Ratings, likes, favorites, statuses (UserContent model)
- [x] Reviews with spoiler flags, edit, soft-delete
- [x] Comments on reviews
- [x] Follow / block relationships
- [x] Movie lists and book shelves
- [x] Activity feed + notifications infrastructure
- [x] Reports and moderation primitives
- [x] Search and discovery endpoints
- [x] Recommendation signal structure
- [x] Light-mode editorial UI (Next.js + Vanilla CSS)
- [x] Side-aligned navbar (logo+links left, auth right)
- [x] Split-screen home page with auth form
- [x] Hub page for Movies / Books section selection
- [x] Vercel + MongoDB Atlas deployment documentation

---

## P1 — Before Public Beta

- [ ] Licensed movie metadata provider (e.g., TMDB) with API key + caching
- [ ] Licensed book metadata provider (e.g., Open Library, Google Books)
- [ ] Image / object storage for user avatars (e.g., Vercel Blob, Cloudinary)
- [ ] Email provider for verification and password reset (e.g., Resend, Postmark)
- [ ] CAPTCHA / bot protection on register and login endpoints
- [ ] Redis / Upstash rate limiting at scale (beyond in-memory)
- [ ] Background job infrastructure for imports and notifications (e.g., Vercel Cron)
- [ ] Error monitoring and alerting (e.g., Sentry)
- [ ] Product analytics with privacy consent and policy
- [ ] Automated Atlas backup verification
- [ ] Load testing on key endpoints
- [ ] Legal: privacy policy, terms of service, copyright / licensing notices
- [ ] Content moderation policy and moderator admin UI

---

## P2 — Post-Beta

- [ ] OpenAPI / Swagger docs generated from routes
- [ ] Admin dashboard (user management, content sync, audit logs)
- [ ] Personalised recommendation engine (beyond signals)
- [ ] Push / email notification delivery
- [ ] Mobile-optimised bottom navigation
- [ ] Internationalisation (i18n) support
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Advanced search (faceted filters, author/director search)
- [ ] Social sharing cards (Open Graph, Twitter Cards)
- [ ] PWA / offline support

---

## Security Sign-off (Before Launch)

- [ ] All demo credentials removed or rotated
- [ ] JWT secrets are cryptographically random (32+ bytes each)
- [ ] CORS restricted to exact production origin
- [ ] No secrets in Git history or browser-exposed bundles
- [ ] MongoDB Atlas user has least-privilege access
- [ ] Atlas Network Access locked down (no `0.0.0.0/0` in production)
- [ ] Rate limiting active on auth endpoints
- [ ] Body size limits confirmed (`1mb` on `express.json`)
- [ ] Security headers verified (Helmet defaults + CSP)
