-- Update court photos to use locally hosted images
UPDATE public.courts
SET photo_url = '/courts/kigali-arena.png'
WHERE name ILIKE '%kigali arena%';

UPDATE public.courts
SET photo_url = '/courts/iprc-kigali.png'
WHERE name ILIKE '%IPRC%' OR name ILIKE '%iprc kigali%';
