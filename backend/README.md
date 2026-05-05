# DRHub Backend

Express + Prisma backend for user authentication and user management.

## Features

- User registration and login with JWT access tokens
- Forgot-password and reset-password flow
- Reusable email module for notifications
- Account activation email on successful signup
- Profile update endpoint
- Document CRUD endpoints
- Fetch all users / fetch specific user
- Role-based authorization (`ADMIN`, `MEMBER`)
- Account status enforcement (`ACTIVE`, `INACTIVE`)
- Prisma ORM with PostgreSQL

## Tech Stack

- Node.js
- Express
- Prisma (`prisma` and `@prisma/client` v6.19.3)
- PostgreSQL
- `bcryptjs` for password hashing
- `jsonwebtoken` for auth tokens

## Project Structure

- `server.js` - Express app bootstrap and global middleware
- `src/routes/userAuthRoutes.js` - API route mapping
- `src/controllers/userAuthController.js` - business logic
- `src/middleware/authMiddleware.js` - auth and authorization middleware
- `src/lib/prisma.js` - Prisma client
- `src/lib/auth.js` - JWT/reset-token helpers
- `emails/` - reusable email sending logic and templates
- `prisma/schema.prisma` - database schema
- `prisma/migrations/` - SQL migrations

## Setup (Windows PowerShell)

1. Install dependencies:

```powershell
npm install
```

2. Create your env file:

```powershell
copy .env.example .env
```

3. Configure `.env` values:

```env
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/drhub_db?schema=public"
JWT_SECRET="replace-with-strong-random-secret"
JWT_EXPIRES_IN="7d"
RESET_TOKEN_EXPIRES_MINUTES=15
ACTIVATION_TOKEN_EXPIRES_HOURS=24
BACKEND_PUBLIC_URL="http://localhost:3000"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM="DRHub <no-reply@example.com>"
```

## Database Commands

Generate Prisma client:

```powershell
npm run prisma:generate
```

Create/apply migration in development:

```powershell
npm run prisma:migrate -- --name init
```

If you need a clean dev database (destructive):

```powershell
npx prisma migrate reset --force
```

## Run Commands

Development mode:

```powershell
npm run dev
```

Production mode:

```powershell
npm run start
```

Base URL:

- `http://localhost:3000`

Health endpoint:

- `GET /`

## Authentication and Authorization

Protected routes require header:

```http
Authorization: Bearer <jwt-token>
```

Authorization behavior:

- `GET /api/users` -> authenticated `ADMIN` only
- `GET /api/users/:id` -> authenticated `ADMIN` or same user (`:id`)
- `PATCH /api/users/:id` -> any authenticated user

Additional access checks:

- Inactive users (`status = INACTIVE`) are blocked from protected actions.

## User Model Summary

Main user fields:

- `id`
- `name`
- `email` (unique)
- `phoneNumber` (optional, unique)
- `gender` (`MALE`, `FEMALE`, `OTHER`)
- `address`
- `city`
- `country`
- `status` (`ACTIVE`, `INACTIVE`)
- `role` (`ADMIN`, `MEMBER`)
- `passwordHash`
- `createdAt`, `updatedAt`

## API Endpoints

Base path: `/api/users`

### Register

- `POST /api/users/register`
- Public route

Request body:

```json
{
  "name": "Amina Yusuf",
  "email": "amina.yusuf@example.com",
  "password": "Amina@12345"
}
```

Notes:

- `role` defaults to `MEMBER`.
- `status` defaults to `INACTIVE`.
- An activation email is sent after successful registration (when SMTP is configured).
- The user must activate account before login.

### Activate Account

- `GET /api/users/activate-account?token=<activation-token>`
- Public route
- This is the link/button target in the activation email.

### Login

- `POST /api/users/login`
- Public route

Request body:

```json
{
  "email": "amina.yusuf@example.com",
  "password": "Amina@12345"
}
```

Inactive users cannot login until account activation.

### Forgot Password

- `POST /api/users/forgot-password`
- Public route

Request body:

```json
{
  "email": "amina.yusuf@example.com"
}
```

### Reset Password

- `POST /api/users/reset-password`
- Public route

Request body:

```json
{
  "token": "paste-reset-token-from-forgot-password-response",
  "password": "Amina@67890"
}
```

### Get All Users

- `GET /api/users`
- Protected route (`ADMIN` only)

### Get User By ID

- `GET /api/users/:id`
- Protected route (`ADMIN` or same user)

### Update User Profile

- `PATCH /api/users/:id`
- Protected route (any authenticated user)

Request body (any subset is allowed):

```json
{
  "name": "Amina Yusuf",
  "email": "amina.yusuf@example.com",
  "phoneNumber": "+2348012345678",
  "gender": "FEMALE",
  "address": "10 Admiralty Way",
  "city": "Lagos",
  "country": "Nigeria",
  "status": "ACTIVE",
  "role": "MEMBER"
}
```

Allowed values:

- `role`: `ADMIN`, `MEMBER`
- `gender`: `MALE`, `FEMALE`, `OTHER`
- `status`: `ACTIVE`, `INACTIVE`

## Document Endpoints

Base path: `/api/documents`

All document routes require authentication header:

```http
Authorization: Bearer <jwt-token>
```

Authorization rules:

- Admin can manage all documents.
- Member can only manage their own documents.

### Create Document

- `POST /api/documents`
- Content type:
  - `multipart/form-data` with file field `document`, or
  - JSON body with `documentFile` URL/path

Request body:

```json
{
  "documentName": "Practicing License",
  "documentFile": "https://example.com/files/license.pdf",
  "status": "PENDING",
  "userId": "optional-user-id-admin-only"
}
```

Form-data example:

- `documentName`: `Practicing License`
- `status`: `PENDING`
- `document`: `<select file>`

### Get All Documents

- `GET /api/documents`
- Admin can optionally filter by `userId` query:
  - `GET /api/documents?userId=<user-id>`

### Get Document By ID

- `GET /api/documents/:id`

Response includes:

- `documentUrl` for frontend preview/open
- `downloadUrl` for forced file download

### Update Document

- `PATCH /api/documents/:id`
- Supports both:
  - JSON (`documentName`, `documentFile`, `status`)
  - `multipart/form-data` with optional `document` file upload

Request body (any subset):

```json
{
  "documentName": "Updated Name",
  "documentFile": "https://example.com/files/updated.pdf",
  "status": "APPROVED"
}
```

### Delete Document

- `DELETE /api/documents/:id`

### Download Document File

- `GET /api/documents/:id/download`
- Returns file as attachment for download (for locally uploaded files).

Allowed document statuses:

- `APPROVED`
- `PENDING`
- `DECLINED`

## Security Notes

- Passwords are hashed with bcrypt before storage.
- JWT tokens are signed with `JWT_SECRET`.
- Password reset tokens are generated randomly and stored hashed in DB.
- Sensitive fields like `passwordHash` are not returned in API user payloads.

## Email Module

Reusable email logic lives inside `emails/`:

- `emails/index.js` - public functions to send emails
- `emails/transporter.js` - SMTP transporter setup
- `emails/templates.js` - email templates

Exported functions:

- `sendEmail({ to, subject, text, html })`
- `sendWelcomeEmail({ to, name })`
- `sendActivationEmail({ to, name, activationUrl })`

Usage example:

```js
const { sendActivationEmail } = require('../emails');

await sendActivationEmail({
  to: 'user@example.com',
  name: 'Jane',
  activationUrl: 'https://drhubbackend-6cucc.ondigitalocean.app/api/users/activate-account?token=abc',
});
```

Behavior notes:

- If SMTP config is missing, email sending is skipped safely.
- Signup still succeeds even if activation email fails.

## Troubleshooting

If you get Windows lock errors like `EBUSY` around `node_modules`:

```powershell
taskkill /F /IM node.exe 2>$null
taskkill /F /IM npm.exe 2>$null
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force .\package-lock.json
npm install
npx prisma generate
npm run dev
```

If lock errors persist, restart Windows and repeat the commands.
