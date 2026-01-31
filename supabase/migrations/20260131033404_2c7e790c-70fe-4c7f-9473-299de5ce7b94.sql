-- Add display_order column for sequential rotation
ALTER TABLE daily_words 
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Populate existing words with sequential order
WITH ordered_words AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as rn
  FROM daily_words
  WHERE is_active = true
)
UPDATE daily_words 
SET display_order = ordered_words.rn
FROM ordered_words 
WHERE daily_words.id = ordered_words.id;

-- Create index for display_order
CREATE INDEX IF NOT EXISTS idx_daily_words_display_order ON daily_words(display_order);

-- Create app_settings table for tracking global state
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings
CREATE POLICY "Anyone can read app settings"
ON app_settings FOR SELECT
TO authenticated
USING (true);

-- Create security definer function for updating settings (founders only)
CREATE OR REPLACE FUNCTION public.update_app_setting(_key TEXT, _value JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO app_settings (key, value, updated_at)
  VALUES (_key, _value, NOW())
  ON CONFLICT (key) 
  DO UPDATE SET value = _value, updated_at = NOW();
END;
$$;

-- Initialize the word rotation tracker
INSERT INTO app_settings (key, value, updated_at)
VALUES ('word_of_day', '{"last_date": null, "last_order": 0}'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;