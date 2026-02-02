-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  court_id TEXT, -- References a court from the static data
  schedule TEXT, -- e.g., "Saturdays 9am", "Tues & Thurs 6pm"
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_members junction table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "Anyone can view communities"
ON public.communities FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create communities"
ON public.communities FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their communities"
ON public.communities FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their communities"
ON public.communities FOR DELETE
USING (auth.uid() = created_by);

-- Community members policies
CREATE POLICY "Anyone can view community members"
ON public.community_members FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join communities"
ON public.community_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
ON public.community_members FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger for communities
CREATE TRIGGER update_communities_updated_at
BEFORE UPDATE ON public.communities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for community members
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;