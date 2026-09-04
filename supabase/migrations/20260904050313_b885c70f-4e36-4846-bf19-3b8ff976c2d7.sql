ALTER TABLE public.profiles DISABLE TRIGGER profiles_bloqueia_auto_promocao;

UPDATE public.profiles
   SET cargo = 'Fundador',
       status = 'Aprovado',
       nome = CASE WHEN coalesce(nome,'') IN ('', 'IPRB SALERNO') THEN 'Evandro Pimentel' ELSE nome END,
       ministerios = CASE WHEN ministerios = '{}' THEN ARRAY['Louvor'] ELSE ministerios END
 WHERE lower(email) = 'louvoriprb7@gmail.com' OR nome ILIKE '%SALERNO%';

ALTER TABLE public.profiles ENABLE TRIGGER profiles_bloqueia_auto_promocao;