import { createFileRoute } from "@tanstack/react-router";
import { LogOut, KeyRound, Pencil } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { usuarioAtual, ministerios } from "@/lib/church-data";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — IPR" },
      {
        name: "description",
        content: "Dados pessoais, cargo, ministério, bio, versículo e mural do membro.",
      },
      { property: "og:title", content: "Meu Perfil — IPR" },
      { property: "og:description", content: "Seus dados e sua função na igreja." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const u = usuarioAtual;
  const min = ministerios.find((m) => m.slug === u.ministerio);
  const iniciais = u.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <AppShell>
      <PageHeader title="Meu Perfil" />
      <div className="space-y-4 px-5 py-5">
        <div className="surface-card flex items-center gap-4 p-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {iniciais}
          </div>
          <div>
            <h2 className="font-display text-xl">{u.nome}</h2>
            <p className="text-xs text-soft">
              {u.cargo}
              {min ? ` · ${min.nome}` : ""}
            </p>
            <p className="text-xs text-primary">{u.funcao}</p>
          </div>
        </div>

        <div className="surface-card divide-y divide-border p-4">
          {[
            ["E-mail", u.email],
            ["WhatsApp", u.whatsapp],
            ["Endereço", u.endereco],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
              <span className="text-soft">{k}</span>
              <span className="text-right font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="surface-card p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-primary">Bio</h3>
          <p className="mt-1 text-sm">{u.bio}</p>
          <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-primary">
            Versículo favorito
          </h3>
          <p className="mt-1 text-sm italic">{u.versiculo}</p>
        </div>

        <div className="surface-card p-4">
          <h3 className="font-display text-lg">Mural</h3>
          <p className="mt-1 text-sm text-soft">Nenhum recado no seu mural ainda.</p>
        </div>

        <div className="surface-card p-4">
          <h3 className="font-display text-lg">Caixa de mensagens</h3>
          <p className="mt-1 text-sm text-soft">Você não tem mensagens novas.</p>
        </div>

        <div className="grid gap-2">
          <button className="surface-card flex items-center gap-3 px-4 py-3 text-sm font-medium">
            <Pencil className="size-4 text-primary" /> Editar dados e foto
          </button>
          <button className="surface-card flex items-center gap-3 px-4 py-3 text-sm font-medium">
            <KeyRound className="size-4 text-primary" /> Trocar senha
          </button>
          <button className="surface-card flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive">
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </div>
    </AppShell>
  );
}
