-- Enable realtime for content editor tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_change_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;

-- Set replica identity for complete change tracking
ALTER TABLE public.lessons REPLICA IDENTITY FULL;
ALTER TABLE public.content_change_log REPLICA IDENTITY FULL;
ALTER TABLE public.subjects REPLICA IDENTITY FULL;