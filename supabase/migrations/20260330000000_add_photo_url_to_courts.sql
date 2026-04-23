-- Add photo_url column to courts table
ALTER TABLE public.courts
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Set the photo for IPRC Kigali Court
UPDATE public.courts
SET photo_url = 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweochaut2m1o6FlO0nnxWrYskTPb6mimhWFsCkJqMqaPJYCBnqcptVw8ZqxxsCkMSZAtb7jos6dszFP-HqTgiP0o7j5vpxIao-4NT2YY0yetMUhr4R9wNxP9OKP63EfHbZ90_vL5dQ=s1360-w1360-h1020-rw'
WHERE name ILIKE '%IPRC%' OR name ILIKE '%iprc kigali%';

-- Set the photo for Kigali Arena Courts
UPDATE public.courts
SET photo_url = 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwep5t45i1pPS96cwJKeIAeZPoPgPpMmXHeLP8rUsnstcT1PBobfxGbpchrvEr6tQ34dEOC539A7JcPHHkZ8TAys0kRs15bNR37Gl9TIZ9Lfa4EpspuSpHRXih837H8P-svEc9Ab3TA=s1360-w1360-h1020-rw'
WHERE name ILIKE '%kigali arena%';

-- Set the photo for African Leadership University Court
UPDATE public.courts
SET photo_url = 'https://www.courtsoftheworld.com/upload/courts/78711/1/COTW-africa-leadership-university-basketball-court-1770985979.jpg'
WHERE name ILIKE '%african leadership%' OR name ILIKE '%africa leadership%' OR name ILIKE '%ALU%';
