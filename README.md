# Service Request Management System

A responsive web-based Service Request Management System developed as part of the VisionRoot Software Engineering Assignment.

The system allows registered users to create and manage their own service requests, while administrators can manage service requests, update request statuses, and manage users through protected administrative functionality.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Features](#features)
* [User Roles](#user-roles)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [System Architecture](#system-architecture)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [Running the Application](#running-the-application)
* [API Endpoints](#api-endpoints)
* [Request Status Flow](#request-status-flow)
* [Validation and Business Rules](#validation-and-business-rules)
* [Authentication and Authorization](#authentication-and-authorization)
* [Testing](#testing)
* [Code Quality](#code-quality)
* [Future Improvements](#future-improvements)
* [Author](#author)

---

## Project Overview

The Service Request Management System provides a centralized platform for managing service requests.

The application consists of:

* A responsive frontend application
* A RESTful backend API
* MongoDB database
* Secure authentication and authorization
* Role-based access control
* Request validation
* Service request management
* Administrative request management
* User management
* Automated testing

The system follows a client-server architecture where the Next.js frontend communicates with the Express REST API through dedicated service modules.

---

## Features

### User Features

Registered users can:

* Register an account
* Log in securely
* Log out
* View their own service requests
* Create a new service request
* View service request details
* Edit their service request while it is `PENDING`
* Cancel an eligible service request
* View the current status of their requests

### Administrator Features

Administrators can:

* Log in through the authentication system
* View all service requests
* Search service requests
* Filter service requests
* Sort service requests
* Paginate service request results
* View service request details
* Update service request statuses
* View all registered users

> Administrative permissions are enforced on the backend API and are not dependent only on frontend route protection.

---

## User Roles

The system contains two main roles.

| Role  | Permissions                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------- |
| USER  | Create, view, edit pending, and cancel eligible own requests                                        |
| ADMIN | View and manage requests, update request status, search/filter/sort/paginate requests, view users   |

### USER

Users can only access their own service requests.

A user cannot modify a request after it has moved beyond the `PENDING` state.

### ADMIN

Administrators have access to administrative functionality through protected endpoints.

Administrators can view all service requests and update their statuses. Administrators cannot create service requests.

---

## Technology Stack

### Frontend

* Next.js 16
* TypeScript
* React 19
* Tailwind CSS 4
* shadcn/ui
* TanStack Table v8
* Axios
* React Hook Form
* Zod v4
* Lucide React
* Sonner

### Backend

* Node.js 20+
* Express.js 5
* TypeScript
* Mongoose 9
* Zod v4
* JWT-based authentication (access + refresh tokens)
* bcryptjs
* Helmet
* CORS
* Cookie Parser
* Morgan
* express-rate-limit

### Database

* MongoDB
* MongoDB Atlas or local MongoDB

### Development Tools

* Git
* npm
* tsx (development server with hot reload)
* Jest + Supertest (automated testing)
* TypeScript

---

## Project Structure

```text
visionroot-service-request-management/
│
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── requests/
│   │   │   ├── new/
│   │   │   ├── [id]/
│   │   │   └── [id]/edit/
│   │   └── admin/
│   │       ├── requests/
│   │       └── users/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── layout/
│   │   └── requests/
│   │
│   ├── services/
│   ├── hooks/
│   ├── providers/
│   ├── types/
│   └── lib/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   │
│   └── package.json
│
├── docs/
├── .gitignore
└── README.md
```

---

## System Architecture

```text
┌─────────────────────────────┐
│        Next.js Frontend     │
│                             │
│ TypeScript + Tailwind CSS   │
│ shadcn/ui + React           │
└──────────────┬──────────────┘
               │
               │ REST API
               │ Axios
               ▼
┌─────────────────────────────┐
│       Express Backend       │
│                             │
│ Routes                      │
│ Controllers                 │
│ Services                    │
│ Middleware                  │
│ Validators                  │
└──────────────┬──────────────┘
               │
               │ Mongoose
               ▼
┌─────────────────────────────┐
│          MongoDB            │
│                             │
│ Users                       │
│ Service Requests            │
│ Refresh Tokens              │
└─────────────────────────────┘
```

The backend follows a layered architecture:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
MongoDB
```

Business logic is kept inside service modules rather than being placed directly inside route handlers.

---

## Prerequisites

Before running the application, install:

* Node.js 20+
* npm
* MongoDB or MongoDB Atlas
* Git

Verify Node.js and npm:

```bash
node --version
npm --version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd visionroot-service-request-management
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

## Environment Variables

### Backend

Create a `.env` file at `backend/.env` using the provided `.env.example` as a reference:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/visionroot-service-request

FRONTEND_URL=http://localhost:3000

JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

For MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/visionroot-service-request?retryWrites=true&w=majority
```

Never commit the `.env` file to version control.

---

### Frontend

Create a `.env.local` file at `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

### Create an Admin Account

After the backend is running, seed an admin user:

```bash
cd backend
npx tsx scripts/seed-admin.ts
```

Default credentials:

```text
Email:    admin@visionroot.com
Password: Admin@1234
```

To use custom credentials:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=MyPass123 npx tsx scripts/seed-admin.ts
```

---

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

---

## API Endpoints

### Authentication

| Method | Endpoint              | Access        | Description                        |
| ------ | --------------------- | ------------- | ---------------------------------- |
| POST   | `/api/auth/register`  | Public        | Register a new user (role: USER)   |
| POST   | `/api/auth/login`     | Public        | Authenticate and receive tokens    |
| POST   | `/api/auth/logout`    | Public        | Revoke refresh token               |
| POST   | `/api/auth/refresh`   | Public        | Refresh access token via cookie    |
| GET    | `/api/auth/me`        | Authenticated | Get current authenticated user     |

---

### Service Requests

| Method | Endpoint                    | Access        | Description                        |
| ------ | --------------------------- | ------------- | ---------------------------------- |
| GET    | `/api/requests`             | Authenticated | List requests (own for USER, all for ADMIN) |
| POST   | `/api/requests`             | USER only     | Create a new request               |
| GET    | `/api/requests/:id`         | Authenticated | Get request details                |
| PUT    | `/api/requests/:id`         | USER only     | Edit own PENDING request           |
| PATCH  | `/api/requests/:id/cancel`  | Authenticated | Cancel eligible request            |
| PATCH  | `/api/requests/:id/status`  | ADMIN only    | Update request status              |

> Note: The edit endpoint uses `PUT`, not `PATCH`.

Query parameters supported on `GET /api/requests`:

```text
page, limit, search, status, category, priority, sortBy, sortOrder
```

Example:

```text
GET /api/requests?page=1&limit=10&status=PENDING&sortBy=createdAt&sortOrder=desc
```

---

### Users

| Method | Endpoint     | Access     | Description               |
| ------ | ------------ | ---------- | ------------------------- |
| GET    | `/api/users` | ADMIN only | List all users (paginated) |

---

## Request Status Flow

Service requests follow defined status transitions.

```text
                 ┌──────────────┐
                 │   PENDING    │
                 └──────┬───────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
     ┌──────────────┐      ┌──────────────┐
     │ IN_PROGRESS  │      │  CANCELLED   │
     └──────┬───────┘      └──────────────┘
            │
   ┌────────┴────────┐
   ▼                 ▼
┌──────────┐  ┌──────────────┐
│ RESOLVED │  │  CANCELLED   │
└──────────┘  └──────────────┘
```

Allowed transitions:

```text
PENDING     → IN_PROGRESS
PENDING     → CANCELLED

IN_PROGRESS → RESOLVED
IN_PROGRESS → CANCELLED
```

Terminal states (no further transitions):

```text
RESOLVED
CANCELLED
```

---

## Validation and Business Rules

The application validates data at both frontend and backend levels.

### Service Request Fields

| Field       | Type   | Values                                    |
| ----------- | ------ | ----------------------------------------- |
| title       | string | 3–200 characters                          |
| description | string | 10–2000 characters                        |
| category    | enum   | `TECHNICAL`, `BILLING`, `ACCOUNT`, `OTHER` |
| priority    | enum   | `LOW`, `MEDIUM`, `HIGH`                   |
| status      | enum   | `PENDING`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED` |

### Business Rules

1. A user can only view their own requests.
2. Only users (not admins) can create service requests.
3. A user can edit their own request only while it is `PENDING`.
4. A user can cancel only a `PENDING` or `IN_PROGRESS` request.
5. Users cannot directly change the request status.
6. Administrators can update request status through valid transitions only.
7. Administrators can view all service requests.
8. Administrative endpoints require administrator authorization.
9. Invalid status transitions are rejected by the backend.
10. The `user` field, `status`, and timestamps are always set server-side and cannot be injected by the client.

Backend validation is the authoritative security boundary.

---

## Authentication and Authorization

The system uses JWT-based authentication with short-lived access tokens and rotating refresh tokens stored in an `httpOnly` cookie.

### Authentication Flow

```text
User
  ↓
Login (POST /api/auth/login)
  ↓
Backend validates credentials
  ↓
Access token (15m) + Refresh token (7d, httpOnly cookie)
  ↓
Protected API requests use Authorization: Bearer <accessToken>
  ↓
Authentication Middleware
  ↓
Role Authorization Middleware (where required)
  ↓
Controller → Service → Model
```

### Session Restore on Page Refresh

On page load, the frontend calls `POST /api/auth/refresh` using the stored httpOnly cookie to silently restore the access token without requiring the user to log in again.

### Roles

| Role  | Description                                |
| ----- | ------------------------------------------ |
| USER  | Default role assigned on registration       |
| ADMIN | Must be assigned directly in the database  |

Protected endpoints use the `authenticate` middleware. Admin endpoints additionally use `authorize("ADMIN")`.

Example middleware chain for admin endpoints:

```text
authenticate → authorize("ADMIN") → controller
```

Frontend route protection redirects users based on role, but backend authorization is always the enforcement boundary.

---

## API Response Format

All responses follow a consistent structure.

### Success

```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Internet Connection Issue"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data"
  }
}
```

Common error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INVALID_STATUS_TRANSITION`, `RATE_LIMITED`.

---

## Testing

### Running Tests

```bash
cd backend

# All tests
npm test

# Unit tests only (no database required)
npm run test:unit

# Integration tests (requires MongoDB Atlas connection)
npm run test:integration

# With coverage report
npm run test:coverage
```

> Integration tests connect to the Atlas database. Ensure your IP is whitelisted in Atlas → Network Access before running them.

### Unit Tests

* `ApiError` class
* Pagination utilities
* Status transition state machine (`canTransition`)
* Zod validators (register, login, create/update request, status update, mongo ID)

### Integration Tests

**Authentication:**
* Successful registration (returns safe user, no password)
* Duplicate email rejection (409)
* Invalid login rejection (401)
* Successful login (access token + refresh cookie)
* Logout cookie clearing
* `GET /api/auth/me` with valid and invalid tokens

**Authorization:**
* User accesses own request
* User cannot access another user's request (403)
* User cannot access admin endpoints (403)
* Admin can access all requests and users

**Service Requests:**
* Create request (server-controlled status and user fields)
* List and paginate requests
* Get by ID with ownership enforcement
* Edit PENDING request; reject editing non-PENDING
* Cancel PENDING request; reject double-cancel
* Admin status update through valid transitions
* Reject invalid status transitions

**Validation:**
* Missing and invalid fields
* Invalid enum values
* Invalid MongoDB ObjectId format

---

## Code Quality

The project follows these practices:

* TypeScript strict mode throughout
* Layered architecture (route → middleware → controller → service → model)
* Reusable components and hooks on the frontend
* Separation of concerns
* Centralized error handling and API error class
* Centralized Axios client with request/response interceptors
* Server-side input validation (Zod)
* Role-based authorization enforced at the API layer
* Environment-based configuration with startup validation
* Consistent API response structure
* Graceful server shutdown on SIGTERM/SIGINT

---

## Frontend Design

The frontend uses:

* Tailwind CSS 4 for styling
* shadcn/ui for reusable UI components
* TanStack Table v8 (`DataTable` component) for request tables
* Responsive layouts for mobile and desktop
* Form validation with React Hook Form + Zod
* Loading, empty, and error states
* Toast notifications (Sonner)
* Confirmation dialogs for destructive actions
* Role-based navigation (admin sees admin nav only; users see user nav only)
* Session restoration on page refresh via refresh token cookie

---

## Database

MongoDB is used as the primary database.

Main collections:

```text
users
serviceRequests
refreshTokens
```

### User

```text
_id, name, email, password (hashed), role, isActive, createdAt, updatedAt
```

### Service Request

```text
_id, user (ref), title, description, category, priority, status, createdAt, updatedAt
```

### Refresh Token

```text
_id, user (ref), tokenHash (SHA-256), expiresAt, revokedAt, createdAt
```

Indexes on frequently queried fields:

```text
User.email (unique)
ServiceRequest.user
ServiceRequest.status
ServiceRequest.category
ServiceRequest.priority
ServiceRequest.createdAt
ServiceRequest.title + description (text index for search)
RefreshToken.expiresAt (TTL — auto-expires documents)
```

---

## Security Considerations

* Passwords hashed with bcrypt (12 salt rounds)
* Access tokens short-lived (15 minutes)
* Refresh tokens stored as SHA-256 hashes; revoked on logout
* httpOnly cookie prevents JavaScript access to refresh token
* Authentication and role authorization middleware on all protected routes
* Helmet security headers
* CORS restricted to frontend origin
* Rate limiting (200 req/15 min global; 20 req/15 min on auth endpoints)
* Request body size limited to 10KB
* Zod validation on all inputs — server is the authoritative boundary
* Secrets and credentials kept out of version control

---

## Author

**Udari Sathsarani**

Software Engineering / IT Professional

Sri Lanka

---

## Assignment

This project was developed as part of the VisionRoot Software Engineering Assignment.

The implementation covers:

* Frontend — Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
* Backend REST API — Express 5, TypeScript, Mongoose 9
* Database — MongoDB Atlas
* Authentication — JWT access + refresh tokens, httpOnly cookie
* Authorization — role-based middleware (USER / ADMIN)
* Validation — Zod v4 on both frontend and backend
* Business rules — status state machine, ownership enforcement
* Automated testing — Jest + Supertest (unit + integration)
* Documentation — this README and inline API docs
* Responsive web design
