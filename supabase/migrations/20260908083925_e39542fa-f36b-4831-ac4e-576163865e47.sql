
CREATE OR REPLACE FUNCTION public.pode_gerir_ministerio(_user_id uuid, _slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.eh_gestor(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.profiles p
         WHERE p.id = _user_id
           AND p.cargo = CASE _slug
                WHEN 'louvor' THEN 'Líder de Louvor'
                WHEN 'jovens' THEN 'Líder de Jovens'
                WHEN 'irmas'  THEN 'Líder de Irmãs'
                ELSE NULL END
      )
$$;
