-- Add additional profile fields for basketball player information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS skill_level TEXT,
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS play_styles TEXT[], -- Array of play styles
ADD COLUMN IF NOT EXISTS availability TEXT[]; -- Array of available days

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.play_styles IS 'Array of play styles: Playmaker, Shooter, Defender, Hustler, Rebounder, Slasher, Post Player, Versatile';
COMMENT ON COLUMN public.profiles.availability IS 'Array of available days: Mon, Tue, Wed, Thu, Fri, Sat, Sun';
