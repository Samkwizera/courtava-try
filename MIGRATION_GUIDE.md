# Database Migration Guide

## Migration: Add Profile Fields

This migration adds additional fields to the `profiles` table to support the full profile editing functionality.

### Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/bbgwtqruaevqrmmqhtlh
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL below
5. Click **Run** or press `Ctrl+Enter`

### SQL to Execute:

```sql
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
```

### Option 2: Run via Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd c:\Users\samue\Desktop\courtava-try

# Link to your project (if not already linked)
supabase link --project-ref bbgwtqruaevqrmmqhtlh

# Push the migration
supabase db push
```

### Verify Migration

After running the migration, verify it worked by:

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `profiles` table
3. Check that the new columns appear:
   - location
   - bio
   - position
   - skill_level
   - height
   - play_styles
   - availability

### What This Migration Does

- **location**: Stores the user's city/location (e.g., "Downtown, City")
- **bio**: A text field for user biography (max 200 characters in the UI)
- **position**: Basketball position (Point Guard, Shooting Guard, etc.)
- **skill_level**: Player skill level (Beginner, Intermediate, Advanced, Pro)
- **height**: Player height (e.g., "6'2\"")
- **play_styles**: Array of play styles the user identifies with
- **availability**: Array of days the user is available to play

All fields are nullable, so existing profiles won't be affected.
