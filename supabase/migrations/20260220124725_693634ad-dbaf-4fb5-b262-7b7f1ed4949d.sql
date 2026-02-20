-- Add proper document columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS document_url text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS document_name text;

-- Safety net: migrate any existing doc: encoded messages (currently 0 rows)
UPDATE messages
SET document_name = split_part(image_url, ':', 2),
    document_url  = substring(image_url FROM position(':' IN substring(image_url FROM position(':' IN image_url) + 1)) + position(':' IN image_url) + 1),
    image_url     = NULL
WHERE image_url LIKE 'doc:%';