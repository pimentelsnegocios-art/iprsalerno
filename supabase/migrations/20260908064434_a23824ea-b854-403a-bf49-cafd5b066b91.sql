CREATE TABLE public.configuracao_igreja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT 'Igreja Presbiteriana Renovada',
  cnpj text NOT NULL DEFAULT '',
  endereco text NOT NULL DEFAULT '',
  mapa_url text NOT NULL DEFAULT '',
  pix_chave text NOT NULL DEFAULT '',
  pix_tipo text NOT NULL DEFAULT 'E-mail',
  pix_banco text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.configuracao_igreja TO authenticated;
GRANT ALL ON public.configuracao_igreja TO service_role;

ALTER TABLE public.configuracao_igreja ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.eh_admin_config(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND cargo IN ('Fundador','Admin'))
$$;

CREATE POLICY "Autenticados veem a configuracao"
  ON public.configuracao_igreja FOR SELECT TO authenticated USING (true);

CREATE POLICY "Fundador e Admin criam a configuracao"
  ON public.configuracao_igreja FOR INSERT TO authenticated
  WITH CHECK (public.eh_admin_config(auth.uid()));

CREATE POLICY "Fundador e Admin editam a configuracao"
  ON public.configuracao_igreja FOR UPDATE TO authenticated
  USING (public.eh_admin_config(auth.uid()))
  WITH CHECK (public.eh_admin_config(auth.uid()));

CREATE TRIGGER configuracao_igreja_touch_updated_at
  BEFORE UPDATE ON public.configuracao_igreja
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.configuracao_igreja (nome, cnpj, endereco, mapa_url, pix_chave, pix_tipo, pix_banco)
VALUES (
  'Igreja Presbiteriana Renovada',
  '',
  'Rua José Finoteli, 730 — Città di Salerno (Jardim Explanada), Campinas / SP',
  'https://maps.app.goo.gl/yuVVKkDf6Sh6ieoV6?g_st=ac',
  'louvoriprb7@gmail.com',
  'E-mail',
  'Banco do Brasil'
);