import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Send } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Textarea } from "@/components/ui/textarea";
import {
  conversaPastoral,
  usuarioAtual,
  type MensagemPastoral,
} from "@/lib/church-data";

export const Route = createFileRoute("/pastoral")({
  head: () => ({
    meta: [
      { title: "Acesso Pastoral — IPR" },
      {
        name: "description",
        content: "Canal privado e identificado com o pastor e presbíteros para assuntos sensíveis.",
      },
      { property: "og:title", content: "Acesso Pastoral — IPR" },
      { property: "og:description", content: "Canal privado com a liderança pastoral." },
    ],
  }),
  component: Pastoral,
});

function Pastoral() {
  const [msgs, setMsgs] = useState<MensagemPastoral[]>(conversaPastoral);
  const [texto, setTexto] = useState("");

  const enviar = () => {
    if (!texto.trim()) return;
    setMsgs([
      ...msgs,
      {
        id: crypto.randomUUID(),
        autor: usuarioAtual.nome,
        papel: usuarioAtual.cargo,
        texto: texto.trim(),
        quando: "Agora",
      },
    ]);
    setTexto("");
  };

  return (
    <AppShell>
      <PageHeader
        title="Acesso Pastoral"
        subtitle="Canal privado — críticas, dúvidas e assuntos sensíveis"
      />
      <div className="px-5 py-5">
        <div className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-xs text-soft">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Apenas você, o Pastor e o Presbítero veem esta conversa. Identificação
            obrigatória — não existe anonimato. O histórico fica preservado.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {msgs.map((m) => {
            const meu = m.autor === usuarioAtual.nome;
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl p-3 ${
                  meu
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "surface-card"
                }`}
              >
                <p className="text-[11px] font-bold opacity-80">
                  {m.autor} · {m.papel}
                </p>
                <p className="mt-1 text-sm">{m.texto}</p>
                <p className="mt-1 text-[10px] opacity-70">{m.quando}</p>
              </div>
            );
          })}
        </div>

        <div className="surface-card mt-5 p-3">
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva sua mensagem ao pastor..."
            className="bg-background"
          />
          <button
            onClick={enviar}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Send className="size-4" /> Enviar como {usuarioAtual.nome}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
