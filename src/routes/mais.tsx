import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, ShieldCheck, LogOut, Lock } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { usuarioAtual, podeVerCaixa, podeVerAdmin } from "@/lib/church-data";

export const Route = createFileRoute("/mais")({
  head: () => ({
    meta: [
      { title: "Mais — IPR" },
      {
        name: "description",
        content: "Livro Caixa, Administração e sair da conta na Igreja Presbiteriana Renovada.",
      },
      { property: "og:title", content: "Mais — IPR" },
      { property: "og:description", content: "Menu expandido do aplicativo da igreja." },
    ],
  }),
  component: Mais,
});

function Mais() {
  const caixa = podeVerCaixa(usuarioAtual.cargo);
  const admin = podeVerAdmin(usuarioAtual.cargo);

  return (
    <AppShell>
      <PageHeader title="Mais" subtitle={`${usuarioAtual.nome} · ${usuarioAtual.cargo}`} />
      <div className="space-y-3 px-5 py-5">
        {caixa ? (
          <Link to="/caixa" className="surface-card flex items-center gap-3 p-4">
            <Wallet className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Livro Caixa</p>
              <p className="text-xs text-soft">Entradas, saídas, saldo e relatórios</p>
            </div>
          </Link>
        ) : (
          <div className="surface-card flex items-center gap-3 p-4 opacity-60">
            <Lock className="size-5" />
            <div>
              <p className="font-semibold">Livro Caixa</p>
              <p className="text-xs text-soft">Acesso restrito à tesouraria e liderança</p>
            </div>
          </div>
        )}

        {admin ? (
          <Link to="/administracao" className="surface-card flex items-center gap-3 p-4">
            <ShieldCheck className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Administração</p>
              <p className="text-xs text-soft">Aprovar cadastros, cargos e ministérios</p>
            </div>
          </Link>
        ) : (
          <div className="surface-card flex items-center gap-3 p-4 opacity-60">
            <Lock className="size-5" />
            <div>
              <p className="font-semibold">Administração</p>
              <p className="text-xs text-soft">Somente Fundador e Admin</p>
            </div>
          </div>
        )}

        <button className="surface-card flex w-full items-center gap-3 p-4 text-destructive">
          <LogOut className="size-5" />
          <span className="font-semibold">Sair</span>
        </button>
      </div>
    </AppShell>
  );
}
