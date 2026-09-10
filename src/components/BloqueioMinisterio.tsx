import { Clock, HeartHandshake, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { NOME_MINISTERIO, type SlugMinisterio } from "@/lib/permissoes";

type Motivo = "pendente" | "rejeitado" | "visitante" | "sem-acesso";

export function BloqueioMinisterio({
  slug,
  motivo = "sem-acesso",
}: {
  slug: SlugMinisterio;
  motivo?: Motivo;
}) {
  const [enviado, setEnviado] = useState(false);
  const nome = NOME_MINISTERIO[slug];

  if (motivo === "pendente") {
    return (
      <div className="surface-card mx-auto max-w-md p-6 text-center">
        <Clock className="mx-auto size-9 text-primary" />
        <p className="mt-4 text-sm leading-relaxed">
          Aguardando aprovação da liderança. Assim que seu cadastro for aprovado, você terá acesso
          aos ministérios.
        </p>
      </div>
    );
  }

  if (motivo === "rejeitado") {
    return (
      <div className="surface-card mx-auto max-w-md p-6 text-center">
        <ShieldAlert className="mx-auto size-9 text-destructive" />
        <p className="mt-4 text-sm leading-relaxed">
          Cadastro não aprovado. Procure a liderança.
        </p>
      </div>
    );
  }

  if (motivo === "visitante") {
    return (
      <div className="surface-card mx-auto max-w-md p-6 text-center">
        <HeartHandshake className="mx-auto size-9 text-primary" />
        <p className="mt-4 text-sm leading-relaxed">
          Que bom ter você conosco! Os ministérios são exclusivos para membros. Fale com a
          liderança para fazer parte 🙏
        </p>
      </div>
    );
  }

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
