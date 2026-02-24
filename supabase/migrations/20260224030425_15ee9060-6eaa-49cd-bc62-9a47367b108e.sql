ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_theme_preference_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_theme_preference_check
CHECK (theme_preference IN ('light', 'dark', 'system'));