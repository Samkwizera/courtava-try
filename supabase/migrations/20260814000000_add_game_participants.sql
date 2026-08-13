CREATE TABLE public.game_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (game_id, user_id)
);

ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game participants" ON public.game_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join games themselves" ON public.game_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave games themselves" ON public.game_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Keep games.current_players in sync with participant rows (host counts as 1 by default).
CREATE OR REPLACE FUNCTION public.sync_game_current_players()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.games
  SET current_players = 1 + (
    SELECT COUNT(*) FROM public.game_participants
    WHERE game_id = COALESCE(NEW.game_id, OLD.game_id)
  )
  WHERE id = COALESCE(NEW.game_id, OLD.game_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER game_participants_sync_insert
AFTER INSERT ON public.game_participants
FOR EACH ROW EXECUTE FUNCTION public.sync_game_current_players();

CREATE TRIGGER game_participants_sync_delete
AFTER DELETE ON public.game_participants
FOR EACH ROW EXECUTE FUNCTION public.sync_game_current_players();
