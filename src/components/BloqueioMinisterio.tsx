import { HeartHandshake } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { NOME_MINISTERIO, type SlugMinisterio } from "@/lib/permissoes";

export function BloqueioMinisterio({ slug }: { slug: SlugMinisterio }) {
  const [enviado, setEnviado] = useState(false);
  const nome = NOME_MINISTERIO[slug];

  return (
    <div className="surface-card mx-auto max-w-md p-6 text-center">
      <HeartHandshake className="mx-auto size-9 text-primary" />
      <p className="mt-4 text-sm leading-relaxed">
        A paz! Esse espaço é exclusivo para membros do ministério de {nome} para fazer parte 🙏
      </p>
      <button
        disabled={enviado}
        onClick={() => {
          setEnviado(true);
          toast.success("Pedido enviado à liderança. Em breve retornamos!");
        }}
        className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {enviado ? "Pedido enviado" : "Solicitar entrada"}
      </button>
    </div>
  );
}
