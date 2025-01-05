-- Drop the _prisma_migrations table to completely reset migration history
DROP TABLE IF EXISTS "_prisma_migrations";

-- Recreate the _prisma_migrations table
CREATE TABLE "_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" text,
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone NOT NULL DEFAULT now(),
    "applied_steps_count" integer NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
