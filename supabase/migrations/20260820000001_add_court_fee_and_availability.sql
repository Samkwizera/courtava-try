-- Add entry fee and availability-note fields to courts, and fill them in
-- for the courts we currently have details on.
ALTER TABLE public.courts
  ADD COLUMN IF NOT EXISTS entry_fee TEXT,
  ADD COLUMN IF NOT EXISTS availability_note TEXT;

UPDATE public.courts
SET entry_fee = '2,000 RWF / hour'
WHERE lower(name) = lower('Kigali Universe');

UPDATE public.courts
SET availability_note = 'Runs start from 6 PM'
WHERE name ILIKE '%carnegie mellon%';

UPDATE public.courts
SET entry_fee = '5,000 RWF'
WHERE lower(name) = lower('Mpano Recreation Centre');
