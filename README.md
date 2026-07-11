# Tutor LMS

Custom LMS for a private tutoring business. Phase 1: auth, Track → Module → Lesson content model, polymorphic content blocks (markdown / LaTeX equation / code snippet / file attachment), tutor authoring UI, student reading UI.

Full product spec: [tutoring_lms_spec.md](./tutoring_lms_spec.md)

## Stack

Next.js (App Router) + TypeScript · Supabase (Postgres, Auth, Storage) · Prisma 7 · Tailwind v4 · Vercel

## Setup

1. Copy `.env.example` to `.env` and fill in the Supabase values. Connection strings come from Dashboard → Connect: `DATABASE_URL` is the **transaction pooler** string (port 6543), `DIRECT_URL` the **session pooler** string (port 5432). API keys are the new-format ones (Settings → API Keys): `sb_publishable_...` and `sb_secret_...`.
2. Install and migrate:

   ```bash
   npm install
   npx prisma migrate deploy   # applies the checked-in init migration
   npx prisma generate
   ```

3. Seed (creates the tutor account, two fake students, two tracks, and the private `attachments` storage bucket):

   ```bash
   npx prisma db seed
   ```

4. `npm run dev` and sign in with `SEED_TUTOR_EMAIL` / `SEED_TUTOR_PASSWORD` (or a seeded student: `alice.student@example.com` / `bob.student@example.com` with `SEED_STUDENT_PASSWORD`).

For future schema changes use `npx prisma migrate dev --name <change>` (runs against `DIRECT_URL`).

## Architecture notes

- **Auth**: Supabase email/password. `src/proxy.ts` refreshes the session and gates all routes; `src/lib/auth.ts` has `requireTutor()` / `requireStudent()` guards used by layouts, actions, and the file route.
- **Authorization is app-layer, not RLS**: Prisma connects with service credentials, so every query path scopes by role (students only see tracks they're enrolled in and `PUBLISHED` lessons). The Supabase JS client is only used for auth and storage.
- **User rows**: `public.User.id` equals `auth.users.id`. Accounts are created by the tutor (Students page) via the admin API — no public signup, no DB trigger.
- **Content blocks**: `ContentBlock` is a `BlockType` enum + JSON `data` column. Per-type shapes live in `src/lib/blocks/schema.ts` (Zod, `satisfies Record<BlockType, ...>` keeps it exhaustive). Rendering dispatch is `src/components/blocks/renderers.tsx`, editing dispatch `src/components/blocks/editors.tsx`. Adding a block type = enum value + migration, one Zod schema, one renderer case, one editor case.
- **File attachments** live in the private `attachments` bucket; downloads go through `/api/files/[blockId]`, which checks access then redirects to a 10-minute signed URL.
