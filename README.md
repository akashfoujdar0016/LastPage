# LastPage

**LastPage** is a personal movie & book diary — rate films and novels, write spoiler reviews, build shelves and watchlists, follow friends, and track everything you've finished, loved, and want next.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 · React · JavaScript/JSX |
| Styling | Vanilla CSS custom design system (no Tailwind) |
| Backend | Express.js · JavaScript |
| Database | MongoDB Atlas · Mongoose ODM |
| Auth | JWT access + rotating refresh tokens (bcryptjs) |
| Validation | Zod |
| Deployment | Vercel (two projects — frontend + backend) |

---

## Monorepo layout

```
LastPage/
├── frontend/          # Next.js browser app (port 3000)
├── backend/           # Express API (port 4000)
├── docs/              # Architecture, API, deployment & checklists
├── REQUIREMENTS.md    # Full product requirements
└── WORKFLOW.md        # User & system workflow specification
```

---

## UI Design

- **Light-mode editorial** — off-white background (`#fafaf9`), dark ink text, warm gold accent (`#b8902a`)
- **Side-aligned navbar** — logo + Movies/Books links on the left, Sign in on the far right
- **Split-screen home** — brand copy left, auth form right
- **Minimalist & premium** — generous whitespace, restrained typography, no decorative noise

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local mongod)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/lastpagedb
MONGODB_DB_NAME=lastpagedb
JWT_ACCESS_SECRET=<random-32+-char-string>
JWT_REFRESH_SECRET=<another-random-32+-char-string>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
CORS_ORIGINS=http://localhost:3000
```

```bash
npm run dev   # starts on http://localhost:4000
```

Seed demo content:
```bash
npm run seed
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

```bash
npm run dev   # starts on http://localhost:3000
```

### Demo credentials
`demo@example.com` / `password123` — remove before any public launch.

---

## Deployment

See [`docs/VERCEL_MONGODB_DEPLOYMENT.md`](docs/VERCEL_MONGODB_DEPLOYMENT.md) for the full Vercel + Atlas deployment guide.

---

## Docs

| File | Contents |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture, domains, security |
| [`docs/API.md`](docs/API.md) | All REST API endpoints |
| [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md) | Quick-start for local dev |
| [`docs/VERCEL_MONGODB_DEPLOYMENT.md`](docs/VERCEL_MONGODB_DEPLOYMENT.md) | Production deployment guide |
| [`docs/VERCEL_PROJECTS.md`](docs/VERCEL_PROJECTS.md) | Vercel project configuration |
| [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md) | Launch readiness checklist |
| [`REQUIREMENTS.md`](REQUIREMENTS.md) | Full product requirements spec |
| [`WORKFLOW.md`](WORKFLOW.md) | User & system workflow spec |
