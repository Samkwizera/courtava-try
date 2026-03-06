CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
  court_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  format TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  current_players INTEGER NOT NULL DEFAULT 1,
  max_players INTEGER NOT NULL,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view games" ON public.games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create games" ON public.games FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their games" ON public.games FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete their games" ON public.games FOR DELETE TO authenticated USING (auth.uid() = host_id);