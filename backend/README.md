# DRHub Backend

Express + Prisma backend for user management:

- User registration
- User login
- Forgot password
- Reset password
- User role support (`USER` default, `ADMIN` available)

## Prerequisites

- Node.js (recommended: 20+)
- npm
- PostgreSQL database
- Prisma ORM `6.19.3` (installed via `package.json`)

## Setup (Windows PowerShell)

1. Install dependencies:

```powershell
npm install
```

2. Create environment file from template:

```powershell
copy .env.example .env
```

3. Update `.env` with your values:

```env
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/drhub_db?schema=public"
JWT_SECRET="replace-with-strong-random-secret"
JWT_EXPIRES_IN="7d"
RESET_TOKEN_EXPIRES_MINUTES=15
```

## Prisma (Database)

Generate Prisma client:

```powershell
npm run prisma:generate
```

Run migrations (first time and after schema changes):

```powershell
npm run prisma:migrate -- --name init
```

## Run the backend

Development mode (with auto-reload):

```powershell
npm run dev
```

Production mode:

```powershell
npm run start
```

Server default URL:

- `http://localhost:3000`

Health check:

- `GET /`

## API Routes

Base path: `/api/users`

### 1) Register

- **POST** `/api/users/register`
- Sample request body:

```json
{
  "name": "Amina Yusuf",
  "email": "amina.yusuf@example.com",
  "password": "Amina@12345"
}
```

`role` is not sent in this request. It is assigned by the backend (`USER` by default).

Response includes user role:

```json
{
  "message": "Registration successful.",
  "token": "jwt-token",
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### 2) Login

- **POST** `/api/users/login`
- Sample request body:

```json
{
  "email": "amina.yusuf@example.com",
  "password": "Amina@12345"
}
```

### 3) Forgot Password

- **POST** `/api/users/forgot-password`
- Sample request body:

```json
{
  "email": "amina.yusuf@example.com"
}
```

### 4) Reset Password

- **POST** `/api/users/reset-password`
- Sample request body:

```json
{
  "token": "paste-reset-token-from-forgot-password-response",
  "password": "Amina@67890"
}
```

## Notes

- User role is stored in DB (`USER` by default).
- In the current setup, `forgot-password` returns `resetToken` in API response for development/testing.
- In production, connect an email provider and send the token by email instead of returning it in response.
- Routes are thin; business logic is inside `src/controllers/userAuthController.js`.

## Troubleshooting

If you see lock errors like `EBUSY` on `node_modules/@prisma/client` (common on Windows), run:

```powershell
taskkill /F /IM node.exe 2>$null
taskkill /F /IM npm.exe 2>$null
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force .\package-lock.json
npm install
npx prisma generate
npm run dev
```

If `node_modules` is still locked, restart Windows and run the same commands again.
