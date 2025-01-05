-- Fix migration history by marking failed migrations as applied
DELETE FROM "_prisma_migrations" WHERE migration_name = '20250105_add_groq_key_model';

INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
SELECT 
  gen_random_uuid()::text, 
  'placeholder_checksum', 
  NOW(), 
  '20250105_add_groq_key_model', 
  NULL, 
  NULL, 
  NOW(), 
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250105_add_groq_key_model'
);
