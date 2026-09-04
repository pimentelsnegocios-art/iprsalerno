-- 1. Remove familiares
DROP TABLE IF EXISTS public.familiares;

-- 2. Avisos
CREATE TABLE IF NOT EXISTS public.avisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  autor text NOT NULL DEFAULT 'Liderança',
  data_publicacao date NOT NULL DEFAULT CURRENT_DATE,
  fixado_home boolean NOT NULL DEFAULT false,
  tipo text NOT NULL DEFAULT 'geral',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.avisos TO authenticated;
GRANT ALL ON public.avisos TO service_role;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY avisos_select_authenticated ON public.avisos FOR SELECT TO authenticated USING (true);
CREATE POLICY avisos_admin_all ON public.avisos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lider'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lider'));
GRANT INSERT, UPDATE, DELETE ON public.avisos TO authenticated;
CREATE TRIGGER avisos_touch_updated_at BEFORE UPDATE ON public.avisos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Perfis: leitura completa apenas do próprio perfil
DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Visão pública mínima
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
  SELECT id, nome, foto_url, ministerio,
         EXTRACT(day FROM nascimento)::int   AS dia_aniversario,
         EXTRACT(month FROM nascimento)::int AS mes_aniversario
  FROM public.profiles;
GRANT SELECT ON public.public_profiles TO authenticated;

-- 4. Blindagem anti auto-promoção
CREATE OR REPLACE FUNCTION public.bloqueia_auto_promocao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.cargo := OLD.cargo;
  NEW.status := OLD.status;
  NEW.funcao := OLD.funcao;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.bloqueia_auto_promocao() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS profiles_bloqueia_auto_promocao ON public.profiles;
CREATE TRIGGER profiles_bloqueia_auto_promocao BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.bloqueia_auto_promocao();

-- 5. promote_user
CREATE OR REPLACE FUNCTION public.promote_user(target_id uuid, new_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  executor_email text := auth.email();
BEGIN
  IF NOT (executor_email = 'louvoriprb7@gmail.com' OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF new_role NOT IN ('admin','lider','membro') THEN
    RAISE EXCEPTION 'invalid role' USING ERRCODE = '22023';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = target_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (target_id, new_role::public.app_role);
  UPDATE public.profiles
     SET cargo = CASE new_role WHEN 'admin' THEN 'Admin' WHEN 'lider' THEN 'Líder' ELSE 'Membro' END,
         status = CASE WHEN new_role = 'membro' THEN status ELSE 'Liderança' END
   WHERE id = target_id;
END;
$$;
REVOKE ALL ON FUNCTION public.promote_user(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.promote_user(uuid, text) TO authenticated;

-- 6. Cadastro: admin apenas para o e-mail dono
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  papel public.app_role := 'membro';
BEGIN
  IF lower(COALESCE(NEW.email, '')) = 'louvoriprb7@gmail.com' THEN
    papel := 'admin';
  END IF;
  INSERT INTO public.profiles (id, nome, email, whatsapp, ministerio, cargo, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'whatsapp',
    NEW.raw_user_meta_data ->> 'ministerio',
    CASE WHEN papel = 'admin' THEN 'Admin' ELSE 'Membro' END,
    CASE WHEN papel = 'admin' THEN 'Liderança' ELSE 'Pendente' END
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, papel)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- 7. Mural aceita recados do sistema
ALTER TABLE public.mural ALTER COLUMN autor_id DROP NOT NULL;

-- 8. Aniversariantes do dia
CREATE OR REPLACE FUNCTION public.check_aniversariantes_hoje()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
  total integer := 0;
  hoje date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  FOR r IN
    SELECT id, nome FROM public.profiles
    WHERE nascimento IS NOT NULL
      AND EXTRACT(day FROM nascimento) = EXTRACT(day FROM hoje)
      AND EXTRACT(month FROM nascimento) = EXTRACT(month FROM hoje)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.avisos
      WHERE tipo = 'aniversario' AND data_publicacao = hoje AND titulo LIKE '%' || r.nome || '%'
    ) THEN
      INSERT INTO public.avisos (titulo, descricao, autor, data_publicacao, fixado_home, tipo)
      VALUES ('Hoje é aniversário do(a) ' || r.nome || '! 🎂',
              'Deixe seu recado no mural e celebre com a família IPRB.',
              'IPRB Renovada', hoje, true, 'aniversario');
      INSERT INTO public.mural (profile_id, autor_id, autor_nome, texto)
      VALUES (r.id, NULL, 'IPRB Renovada',
              'Toda a IPRB te deseja um feliz aniversário! Deixe seu recado aqui');
      total := total + 1;
    END IF;
  END LOOP;
  RETURN total;
END;
$$;
REVOKE ALL ON FUNCTION public.check_aniversariantes_hoje() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  PERFORM cron.unschedule('aniversariantes-diario')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'aniversariantes-diario');
  PERFORM cron.schedule('aniversariantes-diario', '0 10 * * *',
    $cron$SELECT public.check_aniversariantes_hoje();$cron$);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron indisponível: %', SQLERRM;
END;
$$;

-- 9. Storage avatars
DROP POLICY IF EXISTS avatars_select_authenticated ON storage.objects;
CREATE POLICY avatars_select_authenticated ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');