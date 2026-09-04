-- 1. Múltiplos ministérios
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ministerios text[] NOT NULL DEFAULT '{}';
UPDATE public.profiles
   SET ministerios = CASE WHEN coalesce(ministerio,'') = '' THEN '{}'::text[] ELSE ARRAY[ministerio] END
 WHERE ministerios = '{}';

-- 2. Trigger de novo usuário: membro/pendente por padrão, fundador só pelo e-mail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  fundador boolean := lower(COALESCE(NEW.email, '')) = 'louvoriprb7@gmail.com';
  papel public.app_role := CASE WHEN fundador THEN 'admin'::public.app_role ELSE 'membro'::public.app_role END;
  mins text[];
BEGIN
  IF fundador THEN
    mins := ARRAY['Louvor'];
  ELSIF NEW.raw_user_meta_data ? 'ministerios' THEN
    SELECT COALESCE(array_agg(value::text), '{}'::text[])
      INTO mins
      FROM jsonb_array_elements_text(NEW.raw_user_meta_data -> 'ministerios') AS value;
  ELSIF COALESCE(NEW.raw_user_meta_data ->> 'ministerio', '') <> '' THEN
    mins := ARRAY[NEW.raw_user_meta_data ->> 'ministerio'];
  ELSE
    mins := '{}'::text[];
  END IF;

  INSERT INTO public.profiles (id, nome, email, whatsapp, ministerio, ministerios, cargo, status)
  VALUES (
    NEW.id,
    CASE WHEN fundador THEN 'Evandro Pimentel'
         ELSE COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)) END,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'whatsapp',
    NULLIF(mins[1], ''),
    mins,
    CASE WHEN fundador THEN 'Fundador' ELSE 'Membro' END,
    CASE WHEN fundador THEN 'Aprovado' ELSE 'Pendente' END
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, papel)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;

-- 3. Corrige o fundador existente
UPDATE public.profiles
   SET cargo = 'Fundador', status = 'Aprovado',
       ministerios = CASE WHEN ministerios = '{}' THEN ARRAY['Louvor'] ELSE ministerios END
 WHERE lower(email) = 'louvoriprb7@gmail.com';

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::public.app_role FROM public.profiles p
 WHERE lower(p.email) = 'louvoriprb7@gmail.com'
ON CONFLICT DO NOTHING;

-- Quem não é fundador e não tem papel definido vira membro
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'membro'::public.app_role FROM public.profiles p
 WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = p.id)
ON CONFLICT DO NOTHING;

-- 4. Admins administram os cadastros
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS profiles_delete_admin ON public.profiles;
CREATE POLICY profiles_delete_admin ON public.profiles
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND id <> auth.uid()
    AND lower(email) <> 'louvoriprb7@gmail.com'
  );