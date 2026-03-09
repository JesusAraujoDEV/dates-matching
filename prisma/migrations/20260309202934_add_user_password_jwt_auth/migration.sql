-- 1) Add password as nullable to avoid breaking existing rows
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- 2) Backfill existing pair users with bcrypt hashes
UPDATE "User"
SET "password" = '$2b$10$Ikuyf3I/tCFuT6Pi1tjCD.y8aVEZuxOd8pAQ7yAmTF45glPXApIWC'
WHERE LOWER("nombre") = 'jesus';

UPDATE "User"
SET "password" = '$2b$10$n0ckikd/kTNkFvnvdZajEe/RSHt1holBO2MwMjRaokN1pnAZhASPK'
WHERE LOWER("nombre") = 'piera';

-- 3) Safety fallback in case of naming variations
UPDATE "User"
SET "password" = '$2b$10$Ikuyf3I/tCFuT6Pi1tjCD.y8aVEZuxOd8pAQ7yAmTF45glPXApIWC'
WHERE "password" IS NULL;

-- 4) Enforce required column after data backfill
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
