
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  bpm INTEGER NOT NULL DEFAULT 120,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all_projects" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "insert_all_projects" ON projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_all_projects" ON projects FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_all_projects" ON projects FOR DELETE TO anon USING (true);
