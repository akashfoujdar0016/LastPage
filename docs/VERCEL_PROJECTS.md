# Vercel Project Configuration — LastPage

Two separate Vercel projects are created from the same Git repository.

---

## Project 1 — Frontend

| Setting | Value |
|---|---|
| Name | `lastpage-frontend` |
| Root Directory | `frontend` |
| Framework | Next.js (auto-detected) |
| Build Command | `next build` |
| Output | Next.js default |

**Environment variables:**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<backend-domain>/api` |

---

## Project 2 — Backend

| Setting | Value |
|---|---|
| Name | `lastpage-api` |
| Root Directory | `backend` |
| Framework | Other / Node.js |
| Build Command | *(none required for serverless)* |

**Environment variables:**

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | *(Vercel ignores this — leave unset or `4000`)* |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | `lastpagedb` |
| `JWT_ACCESS_SECRET` | 32+ char random secret |
| `JWT_REFRESH_SECRET` | 32+ char random secret (different) |
| `ACCESS_TOKEN_TTL` | `15m` |
| `REFRESH_TOKEN_TTL_DAYS` | `30` |
| `CORS_ORIGINS` | `https://www.yourdomain.com` |

---

## Recommended Domain Setup

| Domain | Project |
|---|---|
| `www.yourdomain.com` | Frontend |
| `api.yourdomain.com` | Backend |

Configure custom domains in each Vercel project's **Domains** tab after initial deployment.

---

## Security Reminders

- Store all secrets only in Vercel environment variables — never commit them to Git.
- Use the least-privilege MongoDB Atlas user (read/write to `lastpagedb` only).
- Set `CORS_ORIGINS` to the exact frontend origin with no trailing slash.
- Use separate secret values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
