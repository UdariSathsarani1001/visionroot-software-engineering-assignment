# VisionRoot Backend API

Express + MongoDB REST API for the VisionRoot Service Request Management System.

---

## Setup

### 1. Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster (or local MongoDB)

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `5000`) |
| `NODE_ENV` | `development` / `production` / `test` |
| `MONGODB_URI` | Full MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (≥ 32 chars) |
| `ACCESS_TOKEN_EXPIRES_IN` | e.g. `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | e.g. `7d` |
| `FRONTEND_URL` | CORS origin, e.g. `http://localhost:3000` |

### 3. Atlas IP whitelist

Integration tests connect directly to Atlas.
Go to **Atlas → Network Access** and add your machine's IP (or `0.0.0.0/0` for dev).

### 4. Install and run

```bash
npm install
npm run dev       # development with hot-reload via tsx
npm run build     # compile TypeScript → dist/
npm start         # run compiled output
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Hot-reload dev server (`tsx watch`) |
| `npm run build` | TypeScript compile → `dist/` |
| `npm start` | Run compiled server |
| `npm test` | Run all tests |
| `npm run test:unit` | Unit tests only (no DB) |
| `npm run test:integration` | Integration tests (requires Atlas) |
| `npm run test:coverage` | Coverage report |

---

## API Reference

Base URL: `http://localhost:5000/api`

All success responses:
```json
{ "success": true, "data": { } }
```

Paginated responses:
```json
{ "success": true, "data": [], "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 } }
```

Error responses:
```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Description" } }
```

---

### Health

#### `GET /api/health`
No auth required. Returns `{ status: "ok" }`.

---

### Authentication

#### `POST /api/auth/register`
Register a new user (always role `USER`).

**Body:**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "password123" }
```

**Response `201`:**
```json
{ "success": true, "data": { "user": { "id": "...", "name": "Alice", "email": "...", "role": "USER" } } }
```

**Errors:** `400` validation, `409` duplicate email.

---

#### `POST /api/auth/login`
**Body:**
```json
{ "email": "alice@example.com", "password": "password123" }
```

**Response `200`:**
```json
{ "success": true, "data": { "user": { ... }, "accessToken": "eyJ..." } }
```
Sets `refreshToken` as an `httpOnly` cookie.

**Errors:** `401` invalid credentials.

---

#### `POST /api/auth/logout`
Revokes the refresh token cookie. Idempotent.

**Response `200`:** `{ "success": true, "data": null }`

---

#### `GET /api/auth/me`
Requires: `Authorization: Bearer <accessToken>`

**Response `200`:** `{ "success": true, "data": { "user": { ... } } }`

---

### Service Requests

All endpoints require `Authorization: Bearer <accessToken>`.

#### `GET /api/requests`
List requests. Users see only their own; admins see all.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default `1`) |
| `limit` | number | Items per page (default `10`, max `100`) |
| `search` | string | Full-text search on title/description |
| `status` | enum | `PENDING`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED` |
| `category` | enum | `TECHNICAL`, `BILLING`, `ACCOUNT`, `OTHER` |
| `priority` | enum | `LOW`, `MEDIUM`, `HIGH` |
| `sortBy` | string | `createdAt`, `updatedAt`, `priority`, `status` |
| `sortOrder` | string | `asc`, `desc` (default `desc`) |

---

#### `POST /api/requests`
Create a new request. Status is always set to `PENDING` server-side.

**Body:**
```json
{
  "title": "Login button broken",
  "description": "The login button does not respond on mobile.",
  "category": "TECHNICAL",
  "priority": "HIGH"
}
```

**Response `201`:** Created request document.

---

#### `GET /api/requests/:id`
Get a single request. Users can only access their own; admins can access any.

**Errors:** `403` access denied, `404` not found, `400` invalid ID.

---

#### `PUT /api/requests/:id`
Update a `PENDING` request. Owner only. Only `title`, `description`, `category`, `priority` can be changed.

**Errors:** `400` if status is not `PENDING`, `403` not the owner.

---

#### `PATCH /api/requests/:id/cancel`
Cancel a `PENDING` or `IN_PROGRESS` request. Owner or admin.

**Errors:** `400` if status is `RESOLVED` or already `CANCELLED`.

---

#### `PATCH /api/requests/:id/status` *(Admin only)*
Update request status through valid transitions.

**Body:** `{ "status": "IN_PROGRESS" }`

**Valid transitions:**
```
PENDING      → IN_PROGRESS, CANCELLED
IN_PROGRESS  → RESOLVED, CANCELLED
RESOLVED     → (none)
CANCELLED    → (none)
```

**Errors:** `400` invalid transition, `403` not admin.

---

### Users *(Admin only)*

#### `GET /api/users`
List all users. Returns `id`, `name`, `email`, `role`, `createdAt` only.

**Query params:** `page`, `limit`

---

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/params failed validation |
| `BAD_REQUEST` | 400 | Invalid operation (e.g. invalid status transition) |
| `UNAUTHORIZED` | 401 | Missing, invalid, or expired token |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate resource (e.g. email already registered) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `INVALID_STATUS_TRANSITION` | 400 | Attempted state machine transition is not allowed |
