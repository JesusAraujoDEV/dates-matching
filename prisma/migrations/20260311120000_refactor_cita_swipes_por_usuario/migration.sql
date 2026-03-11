-- Normalize pending rows so matches stay empty until both users finish swiping
UPDATE "Cita"
SET
    "peliculas_match" = '[]'::jsonb,
    "comidas_match" = '[]'::jsonb
WHERE "estado"::text IN ('creada', 'swiping');

-- Replace enum values with the new three-phase state machine
ALTER TYPE "EstadoCita" RENAME TO "EstadoCita_old";

CREATE TYPE "EstadoCita" AS ENUM ('esperando_pareja', 'muerte_subita', 'finalizada');

ALTER TABLE "Cita"
    ALTER COLUMN "estado" DROP DEFAULT,
    ALTER COLUMN "estado" TYPE "EstadoCita"
    USING (
        CASE
            WHEN "estado"::text IN ('creada', 'swiping') THEN 'esperando_pareja'
            WHEN "estado"::text = 'esperando_votos' THEN 'muerte_subita'
            WHEN "estado"::text = 'finalizada' THEN 'finalizada'
            ELSE 'esperando_pareja'
        END
    )::"EstadoCita",
    ALTER COLUMN "estado" SET DEFAULT 'esperando_pareja';

DROP TYPE "EstadoCita_old";

ALTER TABLE "Cita"
    ADD COLUMN "swipes_jesus_peliculas" JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN "swipes_jesus_comidas" JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN "swipes_piera_peliculas" JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN "swipes_piera_comidas" JSONB NOT NULL DEFAULT '[]'::jsonb;
