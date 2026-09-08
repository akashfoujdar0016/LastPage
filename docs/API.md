# API Reference — LastPage

Base URL (local): `http://localhost:4000/api`  
Base URL (production): `https://<your-api-domain>/api`

All protected endpoints require `Authorization: Bearer <accessToken>`.  
Errors return `{ "error": "message", "details": "..." }` (details omitted in production).

---

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Returns `{ ok: true, db: "connected" }` |

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Create account. Body: `{ username, email, password, displayName? }` |
| POST | `/auth/login` | None | Sign in. Body: `{ email, password }` |
| POST | `/auth/refresh` | None | Rotate tokens. Body: `{ refreshToken }` |
| GET | `/auth/me` | Required | Return current authenticated user |

**Register / Login response:**
```json
{
  "user": { "id": "...", "username": "...", "displayName": "...", "role": "user" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

## Catalog — `/api/content`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/content` | Optional | Browse catalog. Query: `type=MOVIE\|BOOK`, `q`, `genre`, `page`, `limit`, `sort` |
| GET | `/content/:id` | Optional | Get single movie or book detail |
| POST | `/content/:id/status` | Required | Set watch/read status. Body: `{ status }` |
| POST | `/content/:id/rating` | Required | Rate content 0.5–5. Body: `{ value }` |
| DELETE | `/content/:id/rating` | Required | Remove rating |
| POST | `/content/:id/like` | Required | Toggle like |
| POST | `/content/:id/favorite` | Required | Toggle favorite |
| POST | `/content/:id/reviews` | Required | Create review. Body: `{ body, spoiler? }` |
| PATCH | `/content/:id/reviews/:reviewId` | Required (owner) | Edit review |
| DELETE | `/content/:id/reviews/:reviewId` | Required (owner) | Delete review |

---

## Social — `/api/social`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/social/users/:username` | Optional | Get public user profile |
| POST | `/social/users/:id/follow` | Required | Follow / unfollow user |
| POST | `/social/reviews/:id/like` | Required | Toggle review like |
| POST | `/social/reviews/:id/comments` | Required | Add comment. Body: `{ body }` |
| GET | `/social/feed` | Required | Paginated activity feed |
| GET | `/social/notifications` | Required | Paginated notifications |
| POST | `/social/notifications/read` | Required | Mark all notifications read |
| POST | `/social/reports` | Required | File a report. Body: `{ targetType, targetId, reason }` |
| GET | `/social/reports` | Moderator | View moderation queue |

---

## Library — `/api/me`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | Required | Full user profile + library summary |
| GET | `/me/lists` | Required | All user movie lists |
| POST | `/me/lists` | Required | Create list. Body: `{ name, description?, visibility }` |
| POST | `/me/lists/:id/items` | Required | Add item to list. Body: `{ contentId }` |
| DELETE | `/me/lists/:id/items/:itemId` | Required | Remove item from list |
| GET | `/me/shelves` | Required | All user book shelves |
| POST | `/me/shelves` | Required | Create shelf. Body: `{ name, description?, visibility }` |

---

## Discovery — `/api/discovery`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/discovery/home` | Optional | Curated home feed (trending, new, top-rated) |
| GET | `/discovery/recommendations` | Required | Personalised recommendations |

---

## Pagination

All list responses follow:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

---

## Notes

- `MOVIE` and `BOOK` share the same `/api/content` endpoints, differentiated by the `type` field.
- Soft-deleted reviews return `{ deleted: true }` in place of body content.
- Add OpenAPI/Swagger generation as the API stabilises for production.
