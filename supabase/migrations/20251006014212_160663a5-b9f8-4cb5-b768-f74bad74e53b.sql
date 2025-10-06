-- Create post comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post shares table
CREATE TABLE public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'share')),
  content TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_comments
CREATE POLICY "Users can view comments on posts they can see"
ON public.post_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_comments.post_id
    AND (
      posts.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.follows
        WHERE follows.follower_id = auth.uid()
        AND follows.following_id = posts.user_id
        AND follows.status = 'accepted'::follow_status
      )
    )
  )
);

CREATE POLICY "Users can create comments on posts they can see"
ON public.post_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_comments.post_id
    AND (
      posts.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.follows
        WHERE follows.follower_id = auth.uid()
        AND follows.following_id = posts.user_id
        AND follows.status = 'accepted'::follow_status
      )
    )
  )
);

CREATE POLICY "Users can delete their own comments"
ON public.post_comments
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for post_shares
CREATE POLICY "Users can view all shares"
ON public.post_shares
FOR SELECT
USING (true);

CREATE POLICY "Users can share posts they can see"
ON public.post_shares
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_shares.post_id
    AND (
      posts.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.follows
        WHERE follows.follower_id = auth.uid()
        AND follows.following_id = posts.user_id
        AND follows.status = 'accepted'::follow_status
      )
    )
  )
);

CREATE POLICY "Users can unshare posts"
ON public.post_shares
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX idx_post_shares_user_id ON public.post_shares(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);