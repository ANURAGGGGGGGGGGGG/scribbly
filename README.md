# Scribbly (Note App)

Scribbly is a Next.js note-taking app that supports text notes and sketches, with OAuth sign-in via NextAuth (GitHub + Google).

## Getting Started
1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and set the variables from the section below.

3. Run the dev server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Features

- Text notes + drawing canvas (sketch notes)
- Folders, pinning, searching, delete note, delete all
- OAuth login with NextAuth (GitHub + Google)
- Guest warning dialog when creating/deleting while logged out
- Toast notifications for login/logout
- Favicons + web manifest (from `/public`)

## Tech Stack

- Next.js (App Router)
- React
- NextAuth
- Tailwind CSS
- Framer Motion
- react-hot-toast
- lucide-react

## Environment Variables

Set these in `.env`:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret

GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

Notes:
- Facebook login is intentionally disabled for now.
- OAuth providers must have a redirect/callback URL that matches NextAuth (typically `/api/auth/callback/<provider>`).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Data Storage

- If logged in: notes/folders are stored in `localStorage` under keys scoped to your NextAuth user id.
- If logged out: notes/folders are stored in `localStorage` under `scribbly_*_local`.
- Guest data can be lost if browser/site data is cleared, so the UI warns before creating/deleting while logged out.
