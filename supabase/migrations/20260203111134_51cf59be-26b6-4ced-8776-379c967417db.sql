-- Create courts table
CREATE TABLE public.courts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  surface TEXT NOT NULL DEFAULT 'outdoor',
  lights BOOLEAN NOT NULL DEFAULT false,
  water BOOLEAN NOT NULL DEFAULT false,
  parking BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Anyone can view courts
CREATE POLICY "Anyone can view courts"
  ON public.courts FOR SELECT
  USING (true);

-- Authenticated users can add courts
CREATE POLICY "Authenticated users can add courts"
  ON public.courts FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Creators can update their courts
CREATE POLICY "Creators can update their courts"
  ON public.courts FOR UPDATE
  USING (auth.uid() = created_by);

-- Creators can delete their courts
CREATE POLICY "Creators can delete their courts"
  ON public.courts FOR DELETE
  USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_courts_updated_at
  BEFORE UPDATE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for courts
ALTER PUBLICATION supabase_realtime ADD TABLE public.courts;