# Insighta Labs+ — Web Portal

Server-rendered web portal for the Insighta Labs+ profile intelligence platform. Built with Next.js 16, TypeScript, and Tailwind CSS.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + custom CSS variables |
| Auth | GitHub OAuth via backend, httpOnly cookies |
| CSRF | HMAC-SHA256 double-submit cookie pattern |
| Proxy | Next.js Route Handlers → backend |

---

## System Architecture

```
Browser
  │
  ├── Page navigation (GET /dashboard, /profiles, etc.)
  │     └── Next.js Server Component
  │           └── fetch(BACKEND/api/profiles)
  │                 └── Authorization: Bearer <token from httpOnly cookie>
  │
  └── Client interactions (filter, export, logout)
        └── fetch(/api/proxy/...) → Next.js Route Handler → Backend
                                          └── injects Authorization header
                                          └── handles auto token refresh
                                          └── validates CSRF for mutations
```

**Tokens never touch JavaScript.** They live in httpOnly cookies set by the Next.js server. The proxy route handler injects the `Authorization` header on every backend request.

---

## Authentication Flow

1. User clicks **Continue with GitHub** → redirected to `BACKEND/auth/github?client=web`
2. Backend starts GitHub OAuth, stores PKCE state in httpOnly cookies
3. GitHub redirects to `BACKEND/auth/github/callback`
4. Backend validates PKCE, exchanges code, creates/updates user
5. Backend redirects to `NEXT_APP/api/auth/callback?access_token=...&refresh_token=...&username=...`
6. Next.js `/api/auth/callback` sets **httpOnly cookies** and redirects to `/dashboard`

### Token Refresh

The proxy route handler at `/api/proxy/[...path]`:
- Detects `401` from backend
- Calls `POST /auth/refresh` with the refresh token cookie
- Retries the original request with the new access token
- Updates cookies on the response
- Returns `401` to client (triggering redirect to `/login`) if refresh also fails

---

## CSRF Protection

Every mutating request (`POST`, `PUT`, `PATCH`, `DELETE`) must include:

```
x-csrf-token: <token>
```

The middleware sets an `insighta_csrf` cookie (non-httpOnly, readable by JS). Client code reads it:

```js
const csrf = document.cookie
  .split('; ')
  .find(r => r.startsWith('insighta_csrf='))
  ?.split('=')[1];
```

The proxy validates that the header value matches the cookie value AND is a valid HMAC-signed token.

---

## Pages

| Route | Description | Auth |
|---|---|---|
| `/login` | GitHub OAuth login button | Public |
| `/dashboard` | Total profiles, gender breakdown, recent activity | Required |
| `/profiles` | Filterable list with pagination, CSV export | Required |
| `/profiles/[id]` | Full profile detail view | Required |
| `/search` | Natural language search with example queries | Required |
| `/account` | User info, role, logout | Required |

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Your running backend URL (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Random secret for CSRF token signing
# Generate: openssl rand -hex 32
CSRF_SECRET=your_random_secret_here
```

### 3. Backend GitHub OAuth App

In your **web** GitHub OAuth App, set the callback URL to:
```
http://localhost:8080/auth/github/callback
```

In your backend `application-dev.properties`, set:
```properties
github.oauth.portal-callback-url=http://localhost:3000/api/auth/callback
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Set these in Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
CSRF_SECRET=<openssl rand -hex 32>
```

Update your backend:
```properties
github.oauth.portal-callback-url=https://app.yourdomain.com/api/auth/callback
app.cors.allowed-origins=https://app.yourdomain.com
```

---

## Role Enforcement

Roles are enforced by the backend. The portal reflects them:

| Feature | admin | analyst |
|---|---|---|
| List profiles | ✅ | ✅ |
| Search profiles | ✅ | ✅ |
| Export CSV | ✅ | ✅ |
| View profile detail | ✅ | ✅ |

---

## Development

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check
```