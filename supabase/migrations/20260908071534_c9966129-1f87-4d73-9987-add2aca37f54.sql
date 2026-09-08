-- PEDIDOS DE ORAÇÃO
CREATE TABLE public.pedidos_oracao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  autor_nome text NOT NULL DEFAULT '',
  categoria text NOT NULL DEFAULT 'Outros',
  texto text NOT NULL,
  expira_em date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Sao_Paulo')::date + 7),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_oracao TO authenticated;
GRANT ALL ON public.pedidos_oracao TO service_role;
ALTER TABLE public.pedidos_oracao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oracao_select" ON public.pedidos_oracao FOR SELECT TO authenticated USING (true);
CREATE POLICY "oracao_insert" ON public.pedidos_oracao FOR INSERT TO authenticated WITH CHECK (autor_id = auth.uid());
CREATE POLICY "oracao_update" ON public.pedidos_oracao FOR UPDATE TO authenticated USING (autor_id = auth.uid() OR public.eh_gestor(auth.uid())) WITH CHECK (autor_id = auth.uid() OR public.eh_gestor(auth.uid()));
CREATE POLICY "oracao_delete" ON public.pedidos_oracao FOR DELETE TO authenticated USING (autor_id = auth.uid() OR public.eh_gestor(auth.uid()));
CREATE TRIGGER pedidos_oracao_touch BEFORE UPDATE ON public.pedidos_oracao FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.oracao_intercessores (
  pedido_id uuid NOT NULL REFERENCES public.pedidos_oracao(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pedido_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.oracao_intercessores TO authenticated;
GRANT ALL ON public.oracao_intercessores TO service_role;
ALTER TABLE public.oracao_intercessores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercessores_select" ON public.oracao_intercessores FOR SELECT TO authenticated USING (true);
CREATE POLICY "intercessores_insert" ON public.oracao_intercessores FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "intercessores_delete" ON public.oracao_intercessores FOR DELETE TO authenticated USING (user_id = auth.uid());

-- CIFRAS
CREATE TABLE public.cifras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministerio_slug text NOT NULL DEFAULT 'louvor',
  titulo text NOT NULL,
  artista text NOT NULL DEFAULT '',
  tom text NOT NULL DEFAULT 'C',
  linhas jsonb NOT NULL DEFAULT '[]'::jsonb,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cifras TO authenticated;
GRANT ALL ON public.cifras TO service_role;
ALTER TABLE public.cifras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cifras_select" ON public.cifras FOR SELECT TO authenticated USING (true);
CREATE POLICY "cifras_insert" ON public.cifras FOR INSERT TO authenticated WITH CHECK (public.eh_gestor(auth.uid()) OR autor_id = auth.uid());
CREATE POLICY "cifras_update" ON public.cifras FOR UPDATE TO authenticated USING (public.eh_gestor(auth.uid()) OR autor_id = auth.uid()) WITH CHECK (public.eh_gestor(auth.uid()) OR autor_id = auth.uid());
CREATE POLICY "cifras_delete" ON public.cifras FOR DELETE TO authenticated USING (public.eh_gestor(auth.uid()) OR autor_id = auth.uid());
CREATE TRIGGER cifras_touch BEFORE UPDATE ON public.cifras FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CONTRIBUIÇÕES PIX
CREATE TABLE public.contribuicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usuario_nome text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'Dízimo',
  valor numeric NOT NULL CHECK (valor > 0),
  mes_ref text NOT NULL,
  comprovante_nome text NOT NULL DEFAULT '',
  comprovante_url text NOT NULL DEFAULT '',
  comprovante_tipo text NOT NULL DEFAULT 'imagem',
  status text NOT NULL DEFAULT 'pendente',
  motivo text NOT NULL DEFAULT '',
  revisado_por text NOT NULL DEFAULT '',
  revisado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.contribuicoes TO authenticated;
GRANT ALL ON public.contribuicoes TO service_role;
ALTER TABLE public.contribuicoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contrib_select" ON public.contribuicoes FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR public.eh_gestor_caixa(auth.uid()));
CREATE POLICY "contrib_insert" ON public.contribuicoes FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "contrib_update" ON public.contribuicoes FOR UPDATE TO authenticated USING (public.eh_gestor_caixa(auth.uid())) WITH CHECK (public.eh_gestor_caixa(auth.uid()));
CREATE TRIGGER contribuicoes_touch BEFORE UPDATE ON public.contribuicoes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();