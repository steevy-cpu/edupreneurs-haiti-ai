-- Enable realtime for messages table
DO $$
BEGIN
  -- Try to add the table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
  WHEN duplicate_object THEN
    -- Table already in publication, do nothing
    NULL;
END $$;