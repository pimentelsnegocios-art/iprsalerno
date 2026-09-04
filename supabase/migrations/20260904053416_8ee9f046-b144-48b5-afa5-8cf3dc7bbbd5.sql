CREATE OR REPLACE FUNCTION public.eh_gestor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
      OR EXISTS (
        SELECT 1 FROM public.profiles
         WHERE id = _user_id
           AND cargo IN ('Fundador', 'Pastor', 'Presbítero', 'Admin')
      )
$$;

DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT TO authenticated USING (public.eh_gestor(auth.uid()));

DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.eh_gestor(auth.uid()))
  WITH CHECK (public.eh_gestor(auth.uid()));

DROP POLICY IF EXISTS profiles_delete_admin ON public.profiles;
CREATE POLICY profiles_delete_admin ON public.profiles
  FOR DELETE TO authenticated
  USING (
    public.eh_gestor(auth.uid())
    AND id <> auth.uid()
    AND lower(email) <> 'louvoriprb7@gmail.com'
  );

CREATE OR REPLACE FUNCTION public.bloqueia_auto_promocao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.eh_gestor(auth.uid()) AND auth.uid() <> NEW.id THEN
    RETURN NEW;
  END IF;
  NEW.cargo := OLD.cargo;
  NEW.status := OLD.status;
  NEW.funcao := OLD.funcao;
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS avisos_admin_all ON public.avisos;
CREATE POLICY avisos_admin_all ON public.avisos
  FOR ALL TO authenticated
  USING (public.eh_gestor(auth.uid()) OR public.has_role(auth.uid(), 'lider'))
  WITH CHECK (public.eh_gestor(auth.uid()) OR public.has_role(auth.uid(), 'lider'));