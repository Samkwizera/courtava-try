-- Seed additional Kigali basketball courts.
-- Name checks avoid duplicating courts that may have been added manually.
WITH new_courts (
  id,
  name,
  address,
  lat,
  lng,
  surface,
  lights,
  water,
  parking,
  photo_url
) AS (
  VALUES
    (
      '10000000-0000-4000-8000-000000000101'::uuid,
      'Club Rafiki',
      'Avenue de la Nyabarongo, Nyamirambo, Kigali',
      -1.97154,
      30.05583,
      'cement',
      true,
      false,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000102'::uuid,
      'Kabusunzu Primary School Court',
      'Avenue du Mont Kigali, Kabusunzu, Kigali',
      -1.9635701,
      30.053885,
      'outdoor',
      false,
      false,
      false,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000103'::uuid,
      'Institute of Science, Technology and Management Court',
      'Avenue de l''Armee, Kigali',
      -1.96232,
      30.06876,
      'outdoor',
      false,
      false,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000104'::uuid,
      'Petit Stade',
      'KG 11 Ave, Remera, Kigali',
      -1.9565945,
      30.1135471,
      'indoor',
      true,
      true,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000105'::uuid,
      'LDK Gymnasium',
      'Lycee de Kigali, Kiyovu, Kigali',
      -1.96232,
      30.06876,
      'indoor',
      true,
      true,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000106'::uuid,
      'Fitness Point Basketball Court',
      '24W6+6R3, Remera, Kigali',
      -1.9544375,
      30.1120625,
      'cement',
      false,
      false,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000107'::uuid,
      'Africa Leadership University Basketball Court',
      '3572+WP2, Kigali',
      -1.9351875,
      30.1518125,
      'cement',
      false,
      true,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000108'::uuid,
      'Carnegie Mellon University Basketball Court',
      '3575+HQ, Kigali',
      -1.9360625,
      30.1594375,
      'cement',
      false,
      true,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000109'::uuid,
      'Zaria Court Kigali',
      'KG 17 Ave, Remera, Kigali',
      -1.9369,
      30.0941,
      'indoor',
      true,
      true,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000110'::uuid,
      'Saint Ignatius GOA Courts',
      'KG 19 Ave, Kibagabaga, Kigali',
      -1.93686,
      30.11909,
      'outdoor',
      true,
      true,
      true,
      null
    )
)
INSERT INTO public.courts (
  id,
  name,
  address,
  lat,
  lng,
  surface,
  lights,
  water,
  parking,
  photo_url,
  created_by
)
SELECT
  id,
  name,
  address,
  lat,
  lng,
  surface,
  lights,
  water,
  parking,
  photo_url,
  null
FROM new_courts seed
WHERE NOT EXISTS (
  SELECT 1
  FROM public.courts existing
  WHERE lower(existing.name) = lower(seed.name)
)
ON CONFLICT (id) DO NOTHING;
