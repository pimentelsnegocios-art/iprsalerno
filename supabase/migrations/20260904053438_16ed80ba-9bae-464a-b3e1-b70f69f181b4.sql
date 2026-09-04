REVOKE EXECUTE ON FUNCTION public.eh_gestor(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eh_gestor(uuid) TO authenticated;