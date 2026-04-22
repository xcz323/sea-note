<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bea283d2-db1b-472b-9587-78dd578fb8a2

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy env template and fill Supabase keys:
   `cp .env.example .env`
3. In Supabase SQL editor, run:
   - `supabase-schema.sql`
   - `supabase-auth-migration.sql`
4. In Supabase dashboard:
   - Auth -> Providers -> Phone: enable phone auth
   - Configure SMS provider/template for OTP
5. Start frontend + backend:
   `npm run dev:full`

## Auth and API Notes

- Frontend uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for OTP login/register.
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` to verify token and perform server-side operations.
- API expects `Authorization: Bearer <access_token>` for write actions:
  - POST `/api/notes`
  - POST/DELETE `/api/notes/:id/like`
  - POST/DELETE `/api/notes/:id/collect`
