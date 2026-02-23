-- CourtAva Database Setup for New Supabase Project
-- Run this entire script in Supabase SQL Editor
-- Project: dzqtsprnxqhknvqgzybx

-- ============================================
-- STEP 1: Create profiles table
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  location TEXT,
  bio TEXT,
  position TEXT,
  skill_level TEXT,
  height TEXT,
  play_styles TEXT[],
  availability TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 2: Create check_ins table
-- ============================================

CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  court_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '4 hours')
);

-- Enable RLS on check_ins
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active (non-expired) check-ins
CREATE POLICY "Authenticated users can view active check-ins"
ON public.check_ins FOR SELECT
TO authenticated
USING (expires_at > now());

-- Users can insert their own check-ins
CREATE POLICY "Users can insert their own check-ins"
ON public.check_ins FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own check-ins
CREATE POLICY "Users can delete their own check-ins"
ON public.check_ins FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for check_ins
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;

-- ============================================
-- STEP 3: Create communities table
-- ============================================

CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  court_id TEXT,
  schedule TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view communities
CREATE POLICY "Authenticated users can view communities"
ON public.communities FOR SELECT
TO authenticated
USING (true);

-- Users can create communities
CREATE POLICY "Users can create communities"
ON public.communities FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update their own communities
CREATE POLICY "Users can update their own communities"
ON public.communities FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Users can delete their own communities
CREATE POLICY "Users can delete their own communities"
ON public.communities FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- ============================================
-- STEP 4: Create community_members table
-- ============================================

CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Enable RLS on community_members
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view community members
CREATE POLICY "Authenticated users can view community members"
ON public.community_members FOR SELECT
TO authenticated
USING (true);

-- Users can join communities
CREATE POLICY "Users can join communities"
ON public.community_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can leave communities
CREATE POLICY "Users can leave communities"
ON public.community_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: Create courts table
-- ============================================

CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  surface TEXT DEFAULT 'outdoor',
  lights BOOLEAN DEFAULT false,
  water BOOLEAN DEFAULT false,
  parking BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on courts
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view courts
CREATE POLICY "Authenticated users can view courts"
ON public.courts FOR SELECT
TO authenticated
USING (true);

-- Users can create courts
CREATE POLICY "Users can create courts"
ON public.courts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update courts they created
CREATE POLICY "Users can update their own courts"
ON public.courts FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- ============================================
-- STEP 6: Create utility functions and triggers
-- ============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for automatic timestamp updates on communities
CREATE TRIGGER update_communities_updated_at
BEFORE UPDATE ON public.communities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for automatic timestamp updates on courts
CREATE TRIGGER update_courts_updated_at
BEFORE UPDATE ON public.courts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 7: Create indexes for performance
-- ============================================

CREATE INDEX idx_check_ins_expires_at ON public.check_ins(expires_at);
CREATE INDEX idx_check_ins_court_id ON public.check_ins(court_id);
CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX idx_courts_lat_lng ON public.courts(lat, lng);

-- ============================================
-- STEP 8: Add comments for documentation
-- ============================================

COMMENT ON COLUMN public.profiles.play_styles IS 'Array of play styles: Playmaker, Shooter, Defender, Hustler, Rebounder, Slasher, Post Player, Versatile';
COMMENT ON COLUMN public.profiles.availability IS 'Array of available days: Mon, Tue, Wed, Thu, Fri, Sat, Sun';
COMMENT ON TABLE public.check_ins IS 'User check-ins at courts with 4-hour expiration';
COMMENT ON TABLE public.communities IS 'Basketball communities/groups';
COMMENT ON TABLE public.community_members IS 'Members of communities';
COMMENT ON TABLE public.courts IS 'Basketball courts/locations';

-- ============================================
-- Setup Complete!
-- ============================================
-- Your database is now ready for CourtAva
