-- Delete any failed migration records
DELETE FROM "_prisma_migrations" WHERE migration_name = '20250105_fix_migration_history';
DELETE FROM "_prisma_migrations" WHERE migration_name = '20250105_add_groq_key_model';
DELETE FROM "_prisma_migrations" WHERE migration_name = '20250105_fix_missing_columns';
