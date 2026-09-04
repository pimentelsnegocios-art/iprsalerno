-- 1. Limpeza de cadastros fake
ALTER TABLE public.profiles DISABLE TRIGGER profiles_bloqueia_auto_promocao;

DELETE FROM public.profiles
WHERE email ILIKE '%ipr.org.br%'
   OR nome ILIKE '%Marcos Andrade%'
   OR nome ILIKE '%Sérgio Lima%'
   OR nome ILIKE '%Joana%'
   OR nome ILIKE '%Lucas Moreira%'
   OR nome ILIKE '%Tiago Ferreira%'
   OR nome ILIKE '%Débora Nunes%';

-- 2. Identidade do fundador
UPDATE public.profiles
   SET nome = 'IPRB SALERNO',
       cargo = 'Fundador',
       status = 'Aprovado',
       ministerio = 'Louvor',
       ministerios = ARRAY['Louvor']::text[]
 WHERE lower(email) = 'louvoriprb7@gmail.com';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM public.profiles WHERE lower(email) = 'louvoriprb7@gmail.com'
ON CONFLICT DO NOTHING;

-- Conta pessoal nasce como membro comum
UPDATE public.profiles
   SET cargo = 'Membro',
       status = 'Pendente',
       ministerio = 'Louvor',
       ministerios = ARRAY['Louvor']::text[]
 WHERE lower(email) = 'e7pimentel@gmail.com';

DELETE FROM public.user_roles ur
 USING public.profiles p
 WHERE ur.user_id = p.id
   AND lower(p.email) = 'e7pimentel@gmail.com'
   AND ur.role <> 'membro';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'membro'::public.app_role FROM public.profiles WHERE lower(email) = 'e7pimentel@gmail.com'
ON CONFLICT DO NOTHING;

ALTER TABLE public.profiles ENABLE TRIGGER profiles_bloqueia_auto_promocao;

-- 3. Novos cadastros: fundador vira IPRB SALERNO, demais nascem Membro/Pendente
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
    CASE WHEN fundador THEN 'IPRB SALERNO'
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