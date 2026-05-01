-- ============================================================
-- Migration: Email-based account grouping + many-to-many projects
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Email identities table (the new top-level grouping entity)
CREATE TABLE IF NOT EXISTS email_identities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL UNIQUE,
  label       TEXT        NOT NULL DEFAULT '',
  notes       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Link service accounts to an email identity
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS email_id UUID REFERENCES email_identities(id) ON DELETE SET NULL;

-- 3. Junction table: projects ↔ accounts (replaces projects.account_id)
CREATE TABLE IF NOT EXISTS project_accounts (
  project_id  UUID NOT NULL REFERENCES projects(id)  ON DELETE CASCADE,
  account_id  UUID NOT NULL REFERENCES accounts(id)  ON DELETE CASCADE,
  PRIMARY KEY (project_id, account_id)
);

-- 4. Migrate existing single account_id relationships → junction table
INSERT INTO project_accounts (project_id, account_id)
SELECT p.id, p.account_id
FROM   projects p
WHERE  p.account_id IS NOT NULL
  AND  EXISTS (SELECT 1 FROM accounts a WHERE a.id = p.account_id)
ON CONFLICT DO NOTHING;

-- 5. Enable Row Level Security on new tables
ALTER TABLE email_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_accounts ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies (permissive — matches existing app setup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_identities'
      AND policyname = 'Allow all on email_identities'
  ) THEN
    CREATE POLICY "Allow all on email_identities"
      ON email_identities FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_accounts'
      AND policyname = 'Allow all on project_accounts'
  ) THEN
    CREATE POLICY "Allow all on project_accounts"
      ON project_accounts FOR ALL USING (true);
  END IF;
END
$$;

-- ============================================================
-- VERIFY migration worked before running the cleanup below:
--
-- SELECT p.name, a.name AS account, a.platform
-- FROM   project_accounts pa
-- JOIN   projects p ON p.id = pa.project_id
-- JOIN   accounts a ON a.id = pa.account_id;
--
-- OPTIONAL: Drop the legacy column once verified
-- ALTER TABLE projects DROP COLUMN IF EXISTS account_id;
-- ============================================================
