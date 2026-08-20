-- Add Kigali Universe and Mpano Recreation Centre as available courts.
-- Coordinates resolved from the venues' shared Google Maps pins.
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
      '10000000-0000-4000-8000-000000000111'::uuid,
      'Kigali Universe',
      'CHIC Building, 3355+8H, 3rd Floor, Kigali',
      -1.9418297,
      30.0586697,
      'indoor',
      true,
      true,
      true,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000112'::uuid,
      'Mpano Recreation Centre',
      'X3R8+4R, Kigali',
      -2.009478,
      30.067112,
      'indoor',
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
