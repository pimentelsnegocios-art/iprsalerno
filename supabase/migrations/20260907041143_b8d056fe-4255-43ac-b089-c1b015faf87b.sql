CREATE TABLE public.estudos_mensais (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministerio_slug text NOT NULL,
  mes text NOT NULL DEFAULT ''::text,
  titulo text NOT NULL,
  conteudo text NOT NULL DEFAULT ''::text,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT ''::text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudos_mensais TO authenticated;
GRANT ALL ON public.estudos_mensais TO service_role;
ALTER TABLE public.estudos_mensais ENABLE ROW LEVEL SECURITY;
CREATE POLICY estudos_mensais_select ON public.estudos_mensais FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY estudos_mensais_write ON public.estudos_mensais FOR ALL TO authenticated
  USING (public.eh_gestor(auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.cargo ILIKE '%' || estudos_mensais.ministerio_slug || '%'))
  WITH CHECK (public.eh_gestor(auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.cargo ILIKE '%' || estudos_mensais.ministerio_slug || '%'));

CREATE TABLE public.estudos_gerais (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  categoria text NOT NULL DEFAULT ''::text,
  conteudo text NOT NULL DEFAULT ''::text,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT ''::text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudos_gerais TO authenticated;
GRANT ALL ON public.estudos_gerais TO service_role;
ALTER TABLE public.estudos_gerais ENABLE ROW LEVEL SECURITY;
CREATE POLICY estudos_gerais_select ON public.estudos_gerais FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY estudos_gerais_write ON public.estudos_gerais FOR ALL TO authenticated
  USING (public.eh_gestor(auth.uid()))
  WITH CHECK (public.eh_gestor(auth.uid()));