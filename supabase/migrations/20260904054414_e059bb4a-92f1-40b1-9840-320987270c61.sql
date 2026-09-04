CREATE OR REPLACE FUNCTION public.eh_gestor_agenda(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND cargo IN ('Pastor','Presbítero','Fundador','Admin'))
$$;
REVOKE EXECUTE ON FUNCTION public.eh_gestor_agenda(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eh_gestor_agenda(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.eh_gestor_caixa(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND cargo IN ('Pastor','Presbítero','Fundador','Admin','Auxiliar de Caixa'))
$$;
REVOKE EXECUTE ON FUNCTION public.eh_gestor_caixa(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eh_gestor_caixa(uuid) TO authenticated;

CREATE TABLE public.agenda_cultos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  horario text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'culto',
  descricao text NOT NULL DEFAULT '',
  tema text NOT NULL DEFAULT '',
  pregador text NOT NULL DEFAULT '',
  dirigente text NOT NULL DEFAULT '',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_cultos TO authenticated;
GRANT ALL ON public.agenda_cultos TO service_role;
ALTER TABLE public.agenda_cultos ENABLE ROW LEVEL SECURITY;
CREATE POLICY agenda_select_authenticated ON public.agenda_cultos FOR SELECT TO authenticated USING (true);
CREATE POLICY agenda_insert_gestor ON public.agenda_cultos FOR INSERT TO authenticated WITH CHECK (public.eh_gestor_agenda(auth.uid()));
CREATE POLICY agenda_update_gestor ON public.agenda_cultos FOR UPDATE TO authenticated USING (public.eh_gestor_agenda(auth.uid())) WITH CHECK (public.eh_gestor_agenda(auth.uid()));
CREATE POLICY agenda_delete_gestor ON public.agenda_cultos FOR DELETE TO authenticated USING (public.eh_gestor_agenda(auth.uid()));
CREATE TRIGGER agenda_cultos_touch_updated_at BEFORE UPDATE ON public.agenda_cultos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.livro_caixa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('entrada','saida')),
  valor numeric(12,2) NOT NULL DEFAULT 0,
  descricao text NOT NULL DEFAULT '',
  categoria text NOT NULL DEFAULT '',
  forma text NOT NULL DEFAULT 'Dinheiro',
  observacao text NOT NULL DEFAULT '',
  data date NOT NULL DEFAULT CURRENT_DATE,
  comprovante_url text,
  responsavel text NOT NULL DEFAULT '',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.livro_caixa TO authenticated;
GRANT ALL ON public.livro_caixa TO service_role;
ALTER TABLE public.livro_caixa ENABLE ROW LEVEL SECURITY;
CREATE POLICY caixa_all_gestor ON public.livro_caixa FOR ALL TO authenticated USING (public.eh_gestor_caixa(auth.uid())) WITH CHECK (public.eh_gestor_caixa(auth.uid()));
CREATE TRIGGER livro_caixa_touch_updated_at BEFORE UPDATE ON public.livro_caixa FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();