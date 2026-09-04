import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Check, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import {
  ministerios,
  podeVerAdmin,
  usuarioAtual,
  type Cargo,
  type MinisterioSlug,
} from "@/lib/church-data";

export const Route = createFileRoute("/administracao")({
  head: () => ({
    meta: [
      { title: "Administração — IPR" },
      {
        name: "description",
        content: "Aprovação de cadastros com definição dinâmica de cargo, ministério e função.",
      },
      { property: "og:title", content: "Administração — IPR" },
      { property: "og:description", content: "Gestão de membros e permissões." },
    ],
  }),
  component: Administracao,
});

const cargos: Cargo[] = [
  "Fundador",
  "Admin",
  "Pastor",
  "Presbítero",
  "Auxiliar de Caixa",
  "Membro",
];

interface Pendente {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  ministerio: MinisterioSlug | "nenhum";
  funcao: string;
}

const pendentesIniciais: Pendente[] = [
  {
    id: "c1",
    nome: "Joana Reis",
    email: "joana@ipr.org.br",
    cargo: "Auxiliar de Caixa",
    ministerio: "nenhum",
    funcao: "Tesouraria",
  },
  {
    id: "c2",
    nome: "Lucas Moreira",
    email: "lucas@ipr.org.br",
    cargo: "Membro",
    ministerio: "jovens",
    funcao: "Participante",
  },
];

const membros = [
  { nome: "Pr. Marcos Andrade", cargo: "Pastor", ministerio: "—" },
  { nome: "Presb. Sérgio Lima", cargo: "Presbítero", ministerio: "—" },
  { nome: "Tiago Ferreira", cargo: "Membro", ministerio: "Jovens (Líder)" },
  { nome: "Débora Nunes", cargo: "Membro", ministerio: "Irmãs (Líder)" },
];

function Administracao() {
  const [pendentes, setPendentes] = useState(pendentesIniciais);

  if (!podeVerAdmin(usuarioAtual.cargo)) {
    return (
      <AppShell>
        <PageHeader title="Administração" back="/mais" />
        <div className="surface-card mx-5 mt-5 p-5 text-center">
          <Lock className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-sm">Área exclusiva do Fundador e dos Admins.</p>
        </div>
      </AppShell>
    );
  }

  const atualizar = (id: string, patch: Partial<Pendente>) =>
    setPendentes((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <AppShell>
      <PageHeader
        title="Administração"
        subtitle="Aprovação dinâmica — cargo, ministério e função"
        back="/mais"
      />
      <div className="px-5 py-5">
        <h2 className="font-display text-lg">Cadastros pendentes</h2>
        <div className="mt-3 space-y-3">
          {pendentes.map((p) => (
            <div key={p.id} className="surface-card p-4">
              <p className="font-semibold">{p.nome}</p>
              <p className="text-xs text-soft">{p.email}</p>

              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">
                Cargo
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {cargos.map((c) => (
                  <button
                    key={c}
                    onClick={() => atualizar(p.id, { cargo: c })}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      p.cargo === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-soft"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">
                Ministério
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {["nenhum", ...ministerios.map((m) => m.slug)].map((m) => (
                  <button
                    key={m}
                    onClick={() => atualizar(p.id, { ministerio: m as Pendente["ministerio"] })}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                      p.ministerio === m
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-soft"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setPendentes((x) => x.filter((y) => y.id !== p.id))}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <Check className="size-4" /> Aprovar
                </button>
                <button
                  onClick={() => setPendentes((x) => x.filter((y) => y.id !== p.id))}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-soft"
                >
                  <X className="size-4" /> Recusar
                </button>
              </div>
            </div>
          ))}
          {pendentes.length === 0 ? (
            <p className="text-sm text-soft">Nenhum cadastro pendente.</p>
          ) : null}
        </div>

        <h2 className="mt-6 font-display text-lg">Membros e permissões</h2>
        <div className="surface-card mt-3 divide-y divide-border">
          {membros.map((m) => (
            <div key={m.nome} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{m.nome}</p>
                <p className="text-[11px] text-soft">{m.ministerio}</p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px]">
                {m.cargo}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-soft">
          O Fundador pode revogar cargos e transferir acessos a qualquer momento.
        </p>
      </div>
    </AppShell>
  );
}
