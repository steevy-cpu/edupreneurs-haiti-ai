-- Drop existing policy that conflicts
DROP POLICY IF EXISTS "Users can view battles with invite code" ON quiz_battles;

-- Recreate the policy
CREATE POLICY "Users can view battles with invite code"
ON quiz_battles FOR SELECT
USING (invite_code IS NOT NULL AND status = 'waiting');