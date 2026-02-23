-- ============================================
-- Bingo Meeting - Initial Schema
-- ============================================

-- Table: meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  grid_cols INTEGER NOT NULL DEFAULT 3 CHECK (grid_cols BETWEEN 2 AND 5),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  share_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(4), 'hex'),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: themes
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📌',
  color TEXT NOT NULL DEFAULT '#6366f1',
  position INTEGER NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  done_at TIMESTAMPTZ,
  notes TEXT,
  timer_duration INTEGER,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_themes_meeting ON themes(meeting_id, position);

-- Table: photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_theme ON photos(theme_id, position);

-- ============================================
-- Row Level Security
-- ============================================

-- Meetings RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meetings are viewable by creator or via share_code"
  ON meetings FOR SELECT
  USING (auth.uid() = created_by OR share_code IS NOT NULL);

CREATE POLICY "Meetings insertable by authenticated users"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Meetings updatable by creator"
  ON meetings FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Meetings deletable by creator"
  ON meetings FOR DELETE
  USING (auth.uid() = created_by);

-- Themes RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Themes follow meeting access for select"
  ON themes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = themes.meeting_id
      AND (m.created_by = auth.uid() OR m.share_code IS NOT NULL)
    )
  );

CREATE POLICY "Themes insertable by meeting creator"
  ON themes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = themes.meeting_id
      AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Themes updatable by meeting creator"
  ON themes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = themes.meeting_id
      AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Themes deletable by meeting creator"
  ON themes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = themes.meeting_id
      AND m.created_by = auth.uid()
    )
  );

-- Photos RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos follow theme/meeting access for select"
  ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM themes t
      JOIN meetings m ON m.id = t.meeting_id
      WHERE t.id = photos.theme_id
      AND (m.created_by = auth.uid() OR m.share_code IS NOT NULL)
    )
  );

CREATE POLICY "Photos insertable by meeting creator"
  ON photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM themes t
      JOIN meetings m ON m.id = t.meeting_id
      WHERE t.id = photos.theme_id
      AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Photos updatable by meeting creator"
  ON photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM themes t
      JOIN meetings m ON m.id = t.meeting_id
      WHERE t.id = photos.theme_id
      AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Photos deletable by meeting creator"
  ON photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM themes t
      JOIN meetings m ON m.id = t.meeting_id
      WHERE t.id = photos.theme_id
      AND m.created_by = auth.uid()
    )
  );

-- ============================================
-- Updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Storage bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-photos', 'meeting-photos', false);

-- Storage policies
CREATE POLICY "Meeting photos are accessible by meeting participants"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meeting-photos');

CREATE POLICY "Meeting photos uploadable by authenticated users"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meeting-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Meeting photos deletable by authenticated users"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'meeting-photos' AND auth.role() = 'authenticated');

-- ============================================
-- Enable Realtime
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE themes;
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
