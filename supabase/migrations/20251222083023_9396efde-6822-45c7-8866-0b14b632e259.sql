-- Fix 1: Update notifications INSERT policy to only allow users to insert as themselves (actor_id)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications as actor" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = actor_id);

-- Fix 2: Remove duplicate index on push_subscriptions (the unique index already covers this)
DROP INDEX IF EXISTS idx_push_subscriptions_device;