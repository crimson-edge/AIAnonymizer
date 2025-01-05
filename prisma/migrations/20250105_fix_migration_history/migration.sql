-- Fix migration history by marking failed migrations as applied
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES
  ('placeholder_id', 'placeholder_checksum', NOW(), '20250105_add_groq_key_model', NULL, NULL, NOW(), 1)
ON CONFLICT (migration_name) DO NOTHING;
