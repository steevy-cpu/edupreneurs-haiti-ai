-- Add foreign key constraint for generated_by in ai_generation_logs
ALTER TABLE ai_generation_logs 
ADD CONSTRAINT fk_ai_generation_logs_generated_by 
FOREIGN KEY (generated_by) 
REFERENCES profiles(user_id) 
ON DELETE SET NULL;