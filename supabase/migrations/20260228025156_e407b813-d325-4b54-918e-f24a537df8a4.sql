-- Remove 7 tables from realtime publication that have zero frontend subscribers.
-- This reduces server-side broadcast overhead for changes nobody listens to.
ALTER PUBLICATION supabase_realtime DROP TABLE blog_posts;
ALTER PUBLICATION supabase_realtime DROP TABLE chess_match_chat;
ALTER PUBLICATION supabase_realtime DROP TABLE lesson_versions;
ALTER PUBLICATION supabase_realtime DROP TABLE post_likes;
ALTER PUBLICATION supabase_realtime DROP TABLE quiz_battle_weekly_xp;
ALTER PUBLICATION supabase_realtime DROP TABLE subjects;
ALTER PUBLICATION supabase_realtime DROP TABLE user_jude_preferences;