import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Wallet,
  ShieldCheck,
  LogOut,
  Users,
  UserPlus,
  Megaphone,
  HandCoins,
  Settings,
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { usePerfil } from "@/hooks/usePerfil";
import { supabase } from "@/integrations/supabase/client";
import { ehVisitante, podeAprovarCadastros, podeVerCaixaPerfil } from "@/lib/permissoes";

export const Route = createFileRoute("/mais")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mais — IPRB Renovada" },
      {
        name: "description",
        content: "Livro Caixa, Administração e sair da conta na Igreja Presbiteriana Renovada.",
      },
      { property: "og:title", content: "Mais — IPRB Renovada" },
      { property: "og:description", content: "Menu expandido do aplicativo da igreja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Mais,
});

function Mais() {
  const navigate = useNavigate();
  const { perfil, permissao } = usePerfil();

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const visitante = ehVisitante(permissao);
  const caixa = !visitante && podeVerCaixaPerfil(permissao);
  const admin = !visitante && podeAprovarCadastros(permissao);
  const config = !visitante && ["Fundador", "Admin"].includes(permissao.cargo);

  return (
    <AppShell>
      <PageHeader
        title="Mais"
        subtitle={perfil ? `${perfil.nome} · ${perfil.cargo}` : "Menu do aplicativo"}
      />
      <div className="space-y-3 px-5 py-5">
        <Link to="/contribuicoes" className="surface-card flex items-center gap-3 p-4">
          <HandCoins className="size-5 text-primary" />
          <div>
            <p className="font-semibold">PIX da Igreja</p>
            <p className="text-xs text-soft">Dízimos, ofertas e envio de comprovante</p>
          </div>
        </Link>

        {caixa ? (
          <Link to="/caixa" className="surface-card flex items-center gap-3 p-4">
            <Wallet className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Livro Caixa</p>
              <p className="text-xs text-soft">Entradas, saídas, saldo e relatórios</p>
            </div>
          </Link>
        ) : null}

        {admin ? (
          <>
            <Link to="/administracao" className="surface-card flex items-center gap-3 p-4">
              <ShieldCheck className="size-5 text-primary" />
              <div>
                <p className="font-semibold">Administração</p>
                <p className="text-xs text-soft">Aprovar cadastros pendentes</p>
              </div>
            </Link>
            <Link to="/admin/membros" className="surface-card flex items-center gap-3 p-4">
              <Users className="size-5 text-primary" />
              <div>
                <p className="font-semibold">Hall de Membros</p>
                <p className="text-xs text-soft">Cargos, ministérios, bloqueio e exclusão</p>
              </div>
            </Link>
            <Link to="/admin/visitantes" className="surface-card flex items-center gap-3 p-4">
              <UserPlus className="size-5 text-primary" />
              <div>
                <p className="font-semibold">Hall de Visitantes</p>
                <p className="text-xs text-soft">Visitantes cadastrados, converter em membro</p>
              </div>
            </Link>
            <Link to="/admin/avisos" className="surface-card flex items-center gap-3 p-4">
              <Megaphone className="size-5 text-primary" />
              <div>
                <p className="font-semibold">Gestão de Avisos</p>
                <p className="text-xs text-soft">Criar, editar e fixar avisos na Home</p>
              </div>
            </Link>
          </>
        ) : null}

        {config ? (
          <Link to="/configuracao" className="surface-card flex items-center gap-3 p-4">
            <Settings className="size-5 text-primary" />
            <div>
              <p className="font-semibold">⚙️ Configuração da Igreja</p>
              <p className="text-xs text-soft">Nome, CNPJ, endereço e chave PIX oficial</p>
            </div>
          </Link>
        ) : null}

        <button
          onClick={() => void sair()}
          className="surface-card flex w-full items-center gap-3 p-4 text-destructive"
        >
          <LogOut className="size-5" />
          <span className="font-semibold">Sair</span>
        </button>
      </div>
    </AppShell>
  );
}
