# Local Development — LastPage

## Prerequisites

- Node.js 18+
- npm 9+
- A MongoDB Atlas cluster (free M0 tier works fine)

---

## 1. Clone and install

```bash
git clone <repo-url>
cd LastPage
```

---

## 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` with the following variables:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/lastpagedb?retryWrites=true&w=majority
MONGODB_DB_NAME=lastpagedb
JWT_ACCESS_SECRET=<random-string-at-least-32-chars>
JWT_REFRESH_SECRET=<another-random-string-at-least-32-chars>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
CORS_ORIGINS=http://localhost:3000
```

Start the API:

```bash
npm run dev   # http://localhost:4000
```

Seed demo movies and books:

```bash
npm run seed
```

---

## 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the UI:

```bash
npm run dev   # http://localhost:3000
```

---

## 4. Verify

- Open `http://localhost:3000` — you should see the LastPage home page with a light-mode design.
- Check the backend health endpoint: `http://localhost:4000/api/health` → `{ "ok": true, "db": "connected" }`

---

## Demo credentials

After seeding:

| Field | Value |
|---|---|
| Email | `demo@example.com` |
| Password | `password123` |

> **Remove demo credentials before any public launch.**

---

## MongoDB Atlas — Network Access

For local development, add your IP address (or `0.0.0.0/0` for any IP) in Atlas → Network Access. For production, follow Atlas' recommended IP access or private networking approach.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongooseServerSelectionError` | Check `MONGODB_URI` is correct and Atlas Network Access allows your IP |
| `JWT_ACCESS_SECRET` validation error | Ensure the secret is at least 32 characters |
| CORS error in browser | Confirm `CORS_ORIGINS=http://localhost:3000` in backend `.env` |
| Frontend shows old dark theme | Hard refresh (`Ctrl+Shift+R`) to clear Next.js cached styles |
