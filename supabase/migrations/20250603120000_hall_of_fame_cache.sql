-- Hall da Fama: cache pré-calculado (popular via 06.LAB)
CREATE TABLE IF NOT EXISTS hall_of_fame_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gender text NOT NULL DEFAULT 'all',
  edition_id uuid REFERENCES competition_editions(id),
  category text NOT NULL,
  data jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, gender, edition_id, category)
);

ALTER TABLE hall_of_fame_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hof_cache_public_read" ON hall_of_fame_cache
  FOR SELECT TO anon USING (true);

CREATE POLICY "hof_cache_admin_write" ON hall_of_fame_cache
  FOR ALL TO authenticated USING (is_admin());
