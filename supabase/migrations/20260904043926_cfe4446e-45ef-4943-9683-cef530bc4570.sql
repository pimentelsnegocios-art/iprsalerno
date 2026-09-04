DROP VIEW IF EXISTS public.public_profiles;

CREATE OR REPLACE FUNCTION public.aniversariantes_hoje()
RETURNS TABLE (id uuid, nome text, foto_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.nome, p.foto_url
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.nascimento IS NOT NULL
    AND EXTRACT(day FROM p.nascimento) = EXTRACT(day FROM (now() AT TIME ZONE 'America/Sao_Paulo')::date)
    AND EXTRACT(month FROM p.nascimento) = EXTRACT(month FROM (now() AT TIME ZONE 'America/Sao_Paulo')::date)
  ORDER BY p.nome;
$$;
REVOKE ALL ON FUNCTION public.aniversariantes_hoje() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aniversariantes_hoje() TO authenticated;