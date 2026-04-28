# AI Project Tracker

A personal command centre for juggling multiple AI accounts, limit resets, projects, tasks, ideas, context snapshots, and conversation links.

## Run locally

```bash
npm install
npm run dev
```

The app runs with seeded browser-storage data until Supabase is configured.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env`.
4. Fill in:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

5. Restart the dev server.

## Security note

The included schema uses permissive anonymous read/write policies so the personal app works immediately with the public anon key. Before putting private data into a public deployment, add Supabase Auth and change the policies to restrict rows to your user.
