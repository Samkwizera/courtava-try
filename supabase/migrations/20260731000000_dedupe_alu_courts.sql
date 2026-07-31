-- Merge duplicate ALU court rows created by differing Africa/African naming.
WITH alu_courts AS (
  SELECT id
  FROM public.courts
  WHERE
    name ILIKE '%africa leadership university%'
    OR name ILIKE '%african leadership university%'
    OR name ILIKE '%ALU%'
),
canonical AS (
  SELECT id
  FROM alu_courts
  ORDER BY
    CASE WHEN id = '10000000-0000-4000-8000-000000000107'::uuid THEN 0 ELSE 1 END,
    id
  LIMIT 1
),
duplicates AS (
  SELECT alu_courts.id
  FROM alu_courts
  CROSS JOIN canonical
  WHERE alu_courts.id <> canonical.id
)
UPDATE public.check_ins
SET court_id = (SELECT id FROM canonical)
WHERE court_id IN (SELECT id FROM duplicates);

WITH alu_courts AS (
  SELECT id
  FROM public.courts
  WHERE
    name ILIKE '%africa leadership university%'
    OR name ILIKE '%african leadership university%'
    OR name ILIKE '%ALU%'
),
canonical AS (
  SELECT id
  FROM alu_courts
  ORDER BY
    CASE WHEN id = '10000000-0000-4000-8000-000000000107'::uuid THEN 0 ELSE 1 END,
    id
  LIMIT 1
),
duplicates AS (
  SELECT alu_courts.id
  FROM alu_courts
  CROSS JOIN canonical
  WHERE alu_courts.id <> canonical.id
)
UPDATE public.games
SET court_id = (SELECT id FROM canonical)
WHERE court_id IN (SELECT id FROM duplicates);

WITH alu_courts AS (
  SELECT id
  FROM public.courts
  WHERE
    name ILIKE '%africa leadership university%'
    OR name ILIKE '%african leadership university%'
    OR name ILIKE '%ALU%'
),
canonical AS (
  SELECT id
  FROM alu_courts
  ORDER BY
    CASE WHEN id = '10000000-0000-4000-8000-000000000107'::uuid THEN 0 ELSE 1 END,
    id
  LIMIT 1
),
duplicates AS (
  SELECT alu_courts.id
  FROM alu_courts
  CROSS JOIN canonical
  WHERE alu_courts.id <> canonical.id
)
UPDATE public.communities
SET court_id = (SELECT id FROM canonical)
WHERE court_id IN (SELECT id FROM duplicates);

WITH alu_courts AS (
  SELECT id
  FROM public.courts
  WHERE
    name ILIKE '%africa leadership university%'
    OR name ILIKE '%african leadership university%'
    OR name ILIKE '%ALU%'
),
canonical AS (
  SELECT id
  FROM alu_courts
  ORDER BY
    CASE WHEN id = '10000000-0000-4000-8000-000000000107'::uuid THEN 0 ELSE 1 END,
    id
  LIMIT 1
),
duplicates AS (
  SELECT alu_courts.id
  FROM alu_courts
  CROSS JOIN canonical
  WHERE alu_courts.id <> canonical.id
)
DELETE FROM public.courts
WHERE id IN (SELECT id FROM duplicates);
