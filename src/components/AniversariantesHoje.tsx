import { Cake } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

interface Aniversariante {
  id: string;
  nome: string;
  foto: string | null;
}

export function AniversariantesHoje() {
  const [lista, setLista] = useState<Aniversariante[]>([]);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data, error } = await supabase.rpc("aniversariantes_hoje");
      if (error || !data || !ativo) return;

      const comFoto = await Promise.all(
        data.map(async (p) => {
          let foto: string | null = null;
          if (p.foto_url) {
            const { data: signed } = await supabase.storage
              .from("avatars")
              .createSignedUrl(p.foto_url, 3600);
            foto = signed?.signedUrl ?? null;
          }
          return { id: p.id, nome: p.nome, foto };
        }),
      );
      if (ativo) setLista(comFoto);
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  if (lista.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#D4B678] bg-[#C9A86A] p-4 text-white">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]">
        <Cake className="size-4" /> Aniversariantes de hoje
      </div>
      <ul className="mt-3 flex flex-wrap gap-3">
        {lista.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/20 text-sm font-bold">
              {p.foto ? (
                <img src={p.foto} alt={p.nome} className="size-10 object-cover" />
              ) : (
                p.nome.charAt(0).toUpperCase()
              )}
            </span>
            <span className="text-sm font-semibold">{p.nome}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
