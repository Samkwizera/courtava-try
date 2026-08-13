-- Enforce game capacity server-side so concurrent joins can't overbook a game.
CREATE OR REPLACE FUNCTION public.check_game_capacity()
RETURNS TRIGGER AS $$
DECLARE
  cap INTEGER;
  taken INTEGER;
BEGIN
  -- Lock the game row so concurrent joins serialize instead of racing.
  SELECT max_players INTO cap FROM public.games WHERE id = NEW.game_id FOR UPDATE;

  IF cap IS NULL THEN
    RAISE EXCEPTION 'Game not found';
  END IF;

  SELECT COUNT(*) INTO taken FROM public.game_participants WHERE game_id = NEW.game_id;

  IF 1 + taken >= cap THEN
    RAISE EXCEPTION 'Game is full';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER game_participants_check_capacity
BEFORE INSERT ON public.game_participants
FOR EACH ROW EXECUTE FUNCTION public.check_game_capacity();
