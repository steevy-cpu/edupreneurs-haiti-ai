
-- Fix 1: Add DELETE policy on user_passion_preferences for quiz reset
CREATE POLICY "Users can delete own preferences"
ON user_passion_preferences FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Restrict passion_module_progress RLS to authenticated only
DROP POLICY "Users can view own progress" ON passion_module_progress;
CREATE POLICY "Users can view own progress"
ON passion_module_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY "Users can insert own progress" ON passion_module_progress;
CREATE POLICY "Users can insert own progress"
ON passion_module_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can update own progress" ON passion_module_progress;
CREATE POLICY "Users can update own progress"
ON passion_module_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
