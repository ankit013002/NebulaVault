# benzene-auth-service

Self-contained email/password authentication service for NebulaVault. Replaces Auth0/OIDC with a fully owned auth layer backed by PostgreSQL.

---

## Tech Stack

- **Runtime:** Node.js 20 + TypeScript (`tsx`)
- **Framework:** Express 5
- **Database:** PostgreSQL (`pg`)
- **Auth:** JWT access tokens (HS256, 15 min) + opaque refresh tokens (7 days, SHA-256 hashed in DB)
- **Session transport:** `httpOnly` cookies (`session` + `refresh_token`)
- **Email:** nodemailer (verification + password reset)
- **Validation:** Zod
- **Security:** helmet, express-rate-limit, bcrypt (cost 12)
- **Tests:** Vitest

---

## Endpoints

All routes are mounted under `/api/auth`.

| Method | Path                    | Rate limit      | Description                              |
|--------|-------------------------|-----------------|------------------------------------------|
| GET    | `/api/health`           | —               | Health check                             |
| POST   | `/api/auth/signup`      | 3 / hr          | Create account, send verification email  |
| POST   | `/api/auth/login`       | 5 / 15 min      | Authenticate, issue tokens               |
| POST   | `/api/auth/logout`      | —               | Revoke refresh token, clear cookies      |
| POST   | `/api/auth/refresh`     | —               | Rotate refresh token, reissue access token |
| GET    | `/api/auth/verify-email`| —               | Confirm email via link token             |
| POST   | `/api/auth/resend-verification` | 3 / hr  | Resend email verification link           |
| POST   | `/api/auth/forgot-password`    | 5 / hr  | Send password reset email                |
| POST   | `/api/auth/reset-password`     | 5 / hr  | Apply new password, invalidate all sessions |

---

## Database Schema

Four tables — run `src/db/migrations/001_initial.sql` against your PostgreSQL instance before starting.

```
credentials              — email, password_hash, email_verified
refresh_tokens           — token_hash, expires_at (7 days)
email_verification_tokens — token_hash, expires_at (24 hrs)
password_reset_tokens    — token_hash, expires_at (1 hr), used_at
```

---

## Environment Variables

Create a `.env` file in this directory:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/nebulavault_auth

# JWT signing secret — 64 hex chars (32 bytes) or any long random string
AUTH_SECRET=your_secret_here

# Frontend origin — used in email links and cookie security
APP_ORIGIN=http://localhost:3000

# SMTP — for local testing use Mailhog (see below)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="NebulaVault <noreply@nebulavault.dev>"
```

To generate a strong `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the database migration

```bash
psql $DATABASE_URL -f src/db/migrations/001_initial.sql
```

### 3. Start a local email server (optional)

```bash
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Emails are viewable at `http://localhost:8025`.

### 4. Start the service

```bash
npm run dev       # development (watch mode)
npm run start     # production
```

The service runs on `http://localhost:4000` by default.

---

## Running Tests

```bash
npm test               # watch mode
npm run test:run       # single run
npm run test:coverage  # with coverage report
```

Tests cover all 8 controllers and the `tokens`, `cookies`, and `schema` lib utilities.

---

## Docker

```bash
docker build -t benzene-auth-service .
docker run -p 4000:4000 --env-file .env benzene-auth-service
```

---

## Project Structure

```
src/
├── server.ts                  — app bootstrap and route mounting
├── db/
│   ├── index.ts               — pg Pool
│   └── migrations/
│       └── 001_initial.sql    — initial schema
├── lib/
│   ├── tokens.ts              — JWT signing/verification, opaque token generation, SHA-256 hashing
│   ├── cookies.ts             — httpOnly cookie helpers (set/clear)
│   ├── mailer.ts              — nodemailer transport, email templates
│   ├── schema.ts              — Zod validation schemas
│   └── rateLimiter.ts         — express-rate-limit instances
├── middleware/
│   ├── error-handler.ts       — Zod (400), rate limit (429), generic (500)
│   └── not-found.ts           — 404 handler
├── controllers/               — request/response logic, one file per endpoint
├── routes/                    — applies rate limiter + validates + calls controller
├── services/                  — database operations split by domain
│   ├── credentials.service.ts
│   ├── refresh.service.ts
│   ├── email-verification-token.ts
│   ├── password-reset-token.service.ts
│   └── signup.service.ts
└── types/
    └── database.ts            — TypeScript types for DB rows
```
