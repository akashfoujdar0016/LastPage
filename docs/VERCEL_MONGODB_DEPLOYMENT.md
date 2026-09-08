# Vercel + MongoDB Atlas Deployment — LastPage

## Topology

```
Browser → Vercel Frontend (Next.js) → Vercel Backend (Express) → MongoDB Atlas
```

Two separate Vercel projects, both deployed from the same Git repository.

---

## Step 1 — MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user with read/write access to `lastpagedb`.
3. Under **Network Access**, add Vercel's IP ranges (or use `0.0.0.0/0` with a strong password). For production, prefer private networking if available on your Atlas tier.
4. Copy the connection string: `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/lastpagedb`.

---

## Step 2 — Backend Vercel Project

1. In Vercel, create a new project → import the repo → set **Root Directory** to `backend`.
2. Set the following environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://...` (Atlas connection string) |
| `MONGODB_DB_NAME` | `lastpagedb` |
| `JWT_ACCESS_SECRET` | random 32+ character string |
| `JWT_REFRESH_SECRET` | different random 32+ character string |
| `ACCESS_TOKEN_TTL` | `15m` |
| `REFRESH_TOKEN_TTL_DAYS` | `30` |
| `CORS_ORIGINS` | `https://www.yourdomain.com` |

3. Deploy. Note the assigned domain (e.g., `lastpage-api.vercel.app`).

---

## Step 3 — Frontend Vercel Project

1. Create a second Vercel project → same repo → **Root Directory**: `frontend`.
2. Set the environment variable:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<backend-domain>/api` |

3. Deploy. Assign your custom domain (e.g., `www.yourdomain.com`).

---

## Step 4 — Update CORS

After the frontend domain is known, update the backend `CORS_ORIGINS` env var in Vercel to match exactly (no trailing slash).

---

## Production Checklist

- [ ] Rotate all demo/test credentials
- [ ] Generate cryptographically strong JWT secrets (32+ random bytes)
- [ ] Restrict `CORS_ORIGINS` to exact production origin(s)
- [ ] Configure MongoDB Atlas automated backups
- [ ] Set Atlas alerts for connection count and storage
- [ ] Add a licensed metadata provider for real movie/book data
- [ ] Add email provider for verification and password reset
- [ ] Configure object storage for user avatars
- [ ] Add error monitoring (e.g., Sentry)
- [ ] Add product analytics with privacy consent
- [ ] Enable Vercel Preview/Production environment separation
- [ ] Never commit `.env*` files or secrets to Git
