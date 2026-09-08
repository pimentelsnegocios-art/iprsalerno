
CREATE OR REPLACE FUNCTION public.pode_gerir_ministerio(_user_id uuid, _slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.eh_gestor(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.profiles p
         WHERE p.id = _user_id
           AND _slug = ANY(p.ministerios)
           AND (COALESCE(p.cargo,'') ILIKE 'L%der%' OR COALESCE(p.funcao,'') ILIKE '%L%der%')
      )
$$;

CREATE TABLE public.ministerio_ensaios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministerio_slug text NOT NULL,
  data date,
  horario text NOT NULL DEFAULT '',
  local text NOT NULL DEFAULT '',
  titulo text NOT NULL,
  artista text NOT NULL DEFAULT '',
  tom text NOT NULL DEFAULT 'C',
  link text NOT NULL DEFAULT '',
  solistas text[] NOT NULL DEFAULT '{}',
  partes jsonb NOT NULL DEFAULT '[]'::jsonb,
  observacoes text[] NOT NULL DEFAULT '{}',
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministerio_ensaios TO authenticated;
GRANT ALL ON public.ministerio_ensaios TO service_role;
ALTER TABLE public.ministerio_ensaios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ensaios_read" ON public.ministerio_ensaios FOR SELECT TO authenticated USING (true);
CREATE POLICY "ensaios_write" ON public.ministerio_ensaios FOR ALL TO authenticated
  USING (public.pode_gerir_ministerio(auth.uid(), ministerio_slug))
  WITH CHECK (public.pode_gerir_ministerio(auth.uid(), ministerio_slug));
CREATE TRIGGER ministerio_ensaios_touch BEFORE UPDATE ON public.ministerio_ensaios
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ministerio_repertorio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministerio_slug text NOT NULL,
  aba text NOT NULL DEFAULT 'congregacional',
  titulo text NOT NULL,
  artista text NOT NULL DEFAULT '',
  tom text NOT NULL DEFAULT 'C',
  link text NOT NULL DEFAULT '',
  letra text[] NOT NULL DEFAULT '{}',
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministerio_repertorio TO authenticated;
GRANT ALL ON public.ministerio_repertorio TO service_role;
ALTER TABLE public.ministerio_repertorio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "repertorio_read" ON public.ministerio_repertorio FOR SELECT TO authenticated USING (true);
CREATE POLICY "repertorio_write" ON public.ministerio_repertorio FOR ALL TO authenticated
  USING (public.pode_gerir_ministerio(auth.uid(), ministerio_slug))
  WITH CHECK (public.pode_gerir_ministerio(auth.uid(), ministerio_slug));
CREATE TRIGGER ministerio_repertorio_touch BEFORE UPDATE ON public.ministerio_repertorio
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ministerio_avisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministerio_slug text NOT NULL,
  titulo text NOT NULL,
  texto text NOT NULL DEFAULT '',
  fixado boolean NOT NULL DEFAULT false,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministerio_avisos TO authenticated;
GRANT ALL ON public.ministerio_avisos TO service_role;
ALTER TABLE public.ministerio_avisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "min_avisos_read" ON public.ministerio_avisos FOR SELECT TO authenticated USING (true);
CREATE POLICY "min_avisos_write" ON public.ministerio_avisos FOR ALL TO authenticated
  USING (public.pode_gerir_ministerio(auth.uid(), ministerio_slug))
  WITH CHECK (public.pode_gerir_ministerio(auth.uid(), ministerio_slug));
CREATE TRIGGER ministerio_avisos_touch BEFORE UPDATE ON public.ministerio_avisos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ministerio_oracao (
  ministerio_slug text PRIMARY KEY,
  proposito text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministerio_oracao TO authenticated;
GRANT ALL ON public.ministerio_oracao TO service_role;
ALTER TABLE public.ministerio_oracao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "min_oracao_read" ON public.ministerio_oracao FOR SELECT TO authenticated USING (true);
CREATE POLICY "min_oracao_write" ON public.ministerio_oracao FOR ALL TO authenticated
  USING (public.pode_gerir_ministerio(auth.uid(), ministerio_slug))
  WITH CHECK (public.pode_gerir_ministerio(auth.uid(), ministerio_slug));
CREATE TRIGGER ministerio_oracao_touch BEFORE UPDATE ON public.ministerio_oracao
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ministerio_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministerio_slug text NOT NULL,
  texto text NOT NULL,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  autor_nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministerio_checkins TO authenticated;
GRANT ALL ON public.ministerio_checkins TO service_role;
ALTER TABLE public.ministerio_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkins_read" ON public.ministerio_checkins FOR SELECT TO authenticated USING (true);
CREATE POLICY "checkins_insert" ON public.ministerio_checkins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "checkins_update" ON public.ministerio_checkins FOR UPDATE TO authenticated
  USING (auth.uid() = autor_id OR public.pode_gerir_ministerio(auth.uid(), ministerio_slug))
  WITH CHECK (auth.uid() = autor_id OR public.pode_gerir_ministerio(auth.uid(), ministerio_slug));
CREATE POLICY "checkins_delete" ON public.ministerio_checkins FOR DELETE TO authenticated
  USING (auth.uid() = autor_id OR public.pode_gerir_ministerio(auth.uid(), ministerio_slug));
CREATE TRIGGER ministerio_checkins_touch BEFORE UPDATE ON public.ministerio_checkins
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ministerio_agenda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministerio_slug text NOT NULL,
  titulo text NOT NULL,
  tipo text NOT NULL DEFAULT 'Ensaio',
  data date,
  hora text NOT NULL DEFAULT '',
  presencas jsonb NOT NULL DEFAULT '[]'::jsonb,
  louvores jsonb NOT NULL DEFAULT '[]'::jsonb,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministerio_agenda TO authenticated;
GRANT ALL ON public.ministerio_agenda TO service_role;
ALTER TABLE public.ministerio_agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "min_agenda_read" ON public.ministerio_agenda FOR SELECT TO authenticated USING (true);
CREATE POLICY "min_agenda_write" ON public.ministerio_agenda FOR ALL TO authenticated
  USING (public.pode_gerir_ministerio(auth.uid(), ministerio_slug))
  WITH CHECK (public.pode_gerir_ministerio(auth.uid(), ministerio_slug));
CREATE TRIGGER ministerio_agenda_touch BEFORE UPDATE ON public.ministerio_agenda
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ministerio_visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministerio_slug text NOT NULL DEFAULT 'irmas',
  nome text NOT NULL,
  endereco text NOT NULL DEFAULT '',
  data date,
  hora text NOT NULL DEFAULT '',
  irmas text[] NOT NULL DEFAULT '{}',
  realizada boolean NOT NULL DEFAULT false,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministerio_visitas TO authenticated;
GRANT ALL ON public.ministerio_visitas TO service_role;
ALTER TABLE public.ministerio_visitas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitas_read" ON public.ministerio_visitas FOR SELECT TO authenticated USING (true);
CREATE POLICY "visitas_write" ON public.ministerio_visitas FOR ALL TO authenticated
  USING (public.pode_gerir_ministerio(auth.uid(), ministerio_slug))
  WITH CHECK (public.pode_gerir_ministerio(auth.uid(), ministerio_slug));
CREATE TRIGGER ministerio_visitas_touch BEFORE UPDATE ON public.ministerio_visitas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.estudos
  ADD COLUMN IF NOT EXISTS livro_biblico text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ordem_livro integer NOT NULL DEFAULT 999,
  ADD COLUMN IF NOT EXISTS data_estudo date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date;
