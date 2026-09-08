-- helper: pode gerir estudos de uma categoria
CREATE OR REPLACE FUNCTION public.pode_gerir_estudos(_user_id uuid, _categoria text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.eh_gestor(_user_id)
      OR (_categoria = 'jovens' AND EXISTS (
            SELECT 1 FROM public.profiles p
             WHERE p.id = _user_id AND p.cargo = 'Líder de Jovens'))
$$;

CREATE TABLE public.estudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL DEFAULT 'geral',
  titulo text NOT NULL,
  subtitulo text NOT NULL DEFAULT '',
  conteudo_html text NOT NULL DEFAULT '',
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'publicado',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudos TO authenticated;
GRANT ALL ON public.estudos TO service_role;
ALTER TABLE public.estudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY estudos_select ON public.estudos FOR SELECT TO authenticated
  USING (status = 'publicado' OR autor_id = auth.uid() OR public.eh_gestor(auth.uid()));
CREATE POLICY estudos_insert ON public.estudos FOR INSERT TO authenticated
  WITH CHECK (public.pode_gerir_estudos(auth.uid(), categoria) AND autor_id = auth.uid());
CREATE POLICY estudos_update ON public.estudos FOR UPDATE TO authenticated
  USING (public.eh_gestor(auth.uid()) OR (autor_id = auth.uid() AND public.pode_gerir_estudos(auth.uid(), categoria)))
  WITH CHECK (public.eh_gestor(auth.uid()) OR (autor_id = auth.uid() AND public.pode_gerir_estudos(auth.uid(), categoria)));
CREATE POLICY estudos_delete ON public.estudos FOR DELETE TO authenticated
  USING (public.eh_gestor(auth.uid()) OR (autor_id = auth.uid() AND public.pode_gerir_estudos(auth.uid(), categoria)));
CREATE TRIGGER estudos_touch BEFORE UPDATE ON public.estudos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- helper: pode editar um estudo específico
CREATE OR REPLACE FUNCTION public.pode_editar_estudo(_user_id uuid, _estudo_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.estudos e
     WHERE e.id = _estudo_id
       AND (public.eh_gestor(_user_id)
            OR (e.autor_id = _user_id AND public.pode_gerir_estudos(_user_id, e.categoria)))
  )
$$;

CREATE TABLE public.estudo_curiosidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudo_id uuid NOT NULL REFERENCES public.estudos(id) ON DELETE CASCADE,
  titulo text NOT NULL DEFAULT '',
  conteudo text NOT NULL DEFAULT '',
  posicao integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudo_curiosidades TO authenticated;
GRANT ALL ON public.estudo_curiosidades TO service_role;
ALTER TABLE public.estudo_curiosidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY curiosidades_select ON public.estudo_curiosidades FOR SELECT TO authenticated USING (true);
CREATE POLICY curiosidades_write ON public.estudo_curiosidades FOR ALL TO authenticated
  USING (public.pode_editar_estudo(auth.uid(), estudo_id))
  WITH CHECK (public.pode_editar_estudo(auth.uid(), estudo_id));

CREATE TABLE public.estudo_referencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudo_id uuid NOT NULL REFERENCES public.estudos(id) ON DELETE CASCADE,
  livro text NOT NULL DEFAULT '',
  capitulo integer NOT NULL DEFAULT 1,
  versiculo_inicio integer NOT NULL DEFAULT 1,
  versiculo_fim integer,
  descricao text NOT NULL DEFAULT '',
  posicao integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudo_referencias TO authenticated;
GRANT ALL ON public.estudo_referencias TO service_role;
ALTER TABLE public.estudo_referencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY referencias_select ON public.estudo_referencias FOR SELECT TO authenticated USING (true);
CREATE POLICY referencias_write ON public.estudo_referencias FOR ALL TO authenticated
  USING (public.pode_editar_estudo(auth.uid(), estudo_id))
  WITH CHECK (public.pode_editar_estudo(auth.uid(), estudo_id));

CREATE TABLE public.estudo_perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudo_id uuid NOT NULL REFERENCES public.estudos(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  autor_nome text NOT NULL DEFAULT '',
  conteudo text NOT NULL,
  status text NOT NULL DEFAULT 'visivel',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudo_perguntas TO authenticated;
GRANT ALL ON public.estudo_perguntas TO service_role;
ALTER TABLE public.estudo_perguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY perguntas_select ON public.estudo_perguntas FOR SELECT TO authenticated
  USING (status = 'visivel' OR autor_id = auth.uid() OR public.eh_gestor(auth.uid()));
CREATE POLICY perguntas_insert ON public.estudo_perguntas FOR INSERT TO authenticated
  WITH CHECK (autor_id = auth.uid());
CREATE POLICY perguntas_update ON public.estudo_perguntas FOR UPDATE TO authenticated
  USING (autor_id = auth.uid() OR public.eh_gestor(auth.uid()))
  WITH CHECK (autor_id = auth.uid() OR public.eh_gestor(auth.uid()));
CREATE POLICY perguntas_delete ON public.estudo_perguntas FOR DELETE TO authenticated
  USING (autor_id = auth.uid() OR public.eh_gestor(auth.uid()));
CREATE TRIGGER perguntas_touch BEFORE UPDATE ON public.estudo_perguntas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.estudo_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id uuid NOT NULL REFERENCES public.estudo_perguntas(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  autor_nome text NOT NULL DEFAULT '',
  conteudo text NOT NULL,
  oficial boolean NOT NULL DEFAULT false,
  ajudou boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'visivel',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudo_respostas TO authenticated;
GRANT ALL ON public.estudo_respostas TO service_role;
ALTER TABLE public.estudo_respostas ENABLE ROW LEVEL SECURITY;
CREATE POLICY respostas_select ON public.estudo_respostas FOR SELECT TO authenticated
  USING (status = 'visivel' OR autor_id = auth.uid() OR public.eh_gestor(auth.uid()));
CREATE POLICY respostas_insert ON public.estudo_respostas FOR INSERT TO authenticated
  WITH CHECK (autor_id = auth.uid());
CREATE POLICY respostas_update ON public.estudo_respostas FOR UPDATE TO authenticated
  USING (
    autor_id = auth.uid()
    OR public.eh_gestor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.estudo_perguntas p WHERE p.id = pergunta_id AND p.autor_id = auth.uid())
  )
  WITH CHECK (
    autor_id = auth.uid()
    OR public.eh_gestor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.estudo_perguntas p WHERE p.id = pergunta_id AND p.autor_id = auth.uid())
  );
CREATE POLICY respostas_delete ON public.estudo_respostas FOR DELETE TO authenticated
  USING (autor_id = auth.uid() OR public.eh_gestor(auth.uid()));
CREATE TRIGGER respostas_touch BEFORE UPDATE ON public.estudo_respostas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.estudo_pergunta_curtidas (
  pergunta_id uuid NOT NULL REFERENCES public.estudo_perguntas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pergunta_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.estudo_pergunta_curtidas TO authenticated;
GRANT ALL ON public.estudo_pergunta_curtidas TO service_role;
ALTER TABLE public.estudo_pergunta_curtidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY pcurtidas_select ON public.estudo_pergunta_curtidas FOR SELECT TO authenticated USING (true);
CREATE POLICY pcurtidas_insert ON public.estudo_pergunta_curtidas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY pcurtidas_delete ON public.estudo_pergunta_curtidas FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.estudo_resposta_curtidas (
  resposta_id uuid NOT NULL REFERENCES public.estudo_respostas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (resposta_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.estudo_resposta_curtidas TO authenticated;
GRANT ALL ON public.estudo_resposta_curtidas TO service_role;
ALTER TABLE public.estudo_resposta_curtidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY rcurtidas_select ON public.estudo_resposta_curtidas FOR SELECT TO authenticated USING (true);
CREATE POLICY rcurtidas_insert ON public.estudo_resposta_curtidas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY rcurtidas_delete ON public.estudo_resposta_curtidas FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.estudo_salvos (
  estudo_id uuid NOT NULL REFERENCES public.estudos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (estudo_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.estudo_salvos TO authenticated;
GRANT ALL ON public.estudo_salvos TO service_role;
ALTER TABLE public.estudo_salvos ENABLE ROW LEVEL SECURITY;
CREATE POLICY salvos_own ON public.estudo_salvos FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.estudo_denuncias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alvo_tipo text NOT NULL,
  alvo_id uuid NOT NULL,
  autor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  motivo text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.estudo_denuncias TO authenticated;
GRANT ALL ON public.estudo_denuncias TO service_role;
ALTER TABLE public.estudo_denuncias ENABLE ROW LEVEL SECURITY;
CREATE POLICY denuncias_insert ON public.estudo_denuncias FOR INSERT TO authenticated WITH CHECK (autor_id = auth.uid());
CREATE POLICY denuncias_select ON public.estudo_denuncias FOR SELECT TO authenticated USING (public.eh_gestor(auth.uid()));

CREATE TABLE public.estudo_moderacao_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderador_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderador_nome text NOT NULL DEFAULT '',
  acao text NOT NULL,
  alvo_tipo text NOT NULL,
  alvo_id uuid NOT NULL,
  detalhe text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.estudo_moderacao_log TO authenticated;
GRANT ALL ON public.estudo_moderacao_log TO service_role;
ALTER TABLE public.estudo_moderacao_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY modlog_select ON public.estudo_moderacao_log FOR SELECT TO authenticated USING (public.eh_gestor(auth.uid()));
CREATE POLICY modlog_insert ON public.estudo_moderacao_log FOR INSERT TO authenticated
  WITH CHECK (public.eh_gestor(auth.uid()) AND moderador_id = auth.uid());

CREATE INDEX estudos_categoria_idx ON public.estudos (categoria, created_at DESC);
CREATE INDEX curiosidades_estudo_idx ON public.estudo_curiosidades (estudo_id, posicao);
CREATE INDEX referencias_estudo_idx ON public.estudo_referencias (estudo_id, posicao);
CREATE INDEX perguntas_estudo_idx ON public.estudo_perguntas (estudo_id, created_at DESC);
CREATE INDEX respostas_pergunta_idx ON public.estudo_respostas (pergunta_id, created_at);