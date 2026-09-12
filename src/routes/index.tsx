import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  HandHeart,
  BookOpen,
  Landmark,
  User,
  MessageSquareLock,
  Cross,
  Megaphone,
  MapPin,
  CalendarCheck,
  ExternalLink,
} from "lucide-react";

import { AniversariantesHoje } from "@/components/AniversariantesHoje";
import { AppShell } from "@/components/AppShell";
import { useCultos } from "@/lib/agenda-cultos";
import { useConfigIgreja } from "@/hooks/useConfigIgreja";
import { usePerfil } from "@/hooks/usePerfil";
import { estaPendente, estaRejeitado } from "@/lib/permissoes";
import { useAvisos, dataAvisoBR } from "@/lib/avisos-db";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Igreja Presbiteriana Renovada — App da Igreja" },
      {
        name: "description",
        content:
          "Avisos, agenda de cultos, pedidos de oração, estudos bíblicos e ministérios da Igreja Presbiteriana Renovada.",
      },
      { property: "og:title", content: "Igreja Presbiteriana Renovada" },
      {
        property: "og:description",
        content: "Avisos, cultos, oração, estudos e ministérios em um só lugar.",
      },
    ],
  }),
  component: Home,
});

const botoes = [
  { to: "/perfil", label: "Meu Perfil", Icon: User },
  { to: "/oracao", label: "Oração", Icon: HandHeart },
  { to: "/ministerios", label: "Ministérios", Icon: Landmark },
  { to: "/estudo", label: "Estudo", Icon: BookOpen },
  { to: "/agenda", label: "Agenda", Icon: CalendarDays },
  { to: "/pastoral", label: "Canal Pastoral", Icon: MessageSquareLock },
] as const;

function Home() {
  const { perfil } = usePerfil();
  const { config } = useConfigIgreja();
  const { avisos } = useAvisos();
  const { cultos } = useCultos();
  const aviso = avisos.find((a) => a.fixado_home) ?? avisos[0];


  return (
    <AppShell>
      <header className="header-gradient px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/50 text-primary">
            <Cross className="size-6" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-primary">IGREJA</p>
            <h1 className="font-display text-xl leading-tight font-extrabold md:text-2xl">
              {config.nome}
            </h1>
          </div>
        </div>
        <a
          href={config.mapa_url || "https://maps.app.goo.gl/yuVVKkDf6Sh6ieoV6?g_st=ac"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-start gap-1.5 border-l-2 border-primary/60 pl-2.5 text-xs text-background/75 transition hover:text-primary"
        >
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
          {config.endereco}
          <ExternalLink className="mt-0.5 size-3 shrink-0 text-primary/70" />
        </a>
      </header>

      <section className="space-y-3 px-5 pt-4">
        {perfil && estaPendente(perfil) ? (
          <div className="surface-card border-primary/40 p-4 text-sm">
            Seu cadastro está aguardando aprovação da liderança. Assim que aprovado, você terá
            acesso aos ministérios.
          </div>
        ) : null}
        {perfil && estaRejeitado(perfil) ? (
          <div className="surface-card border-destructive/50 p-4 text-sm">
            Cadastro não aprovado. Procure a liderança.
          </div>
        ) : null}
        <AniversariantesHoje />
        <Link

          to="/avisos"
          className="notice-gradient relative block overflow-hidden rounded-2xl border border-primary/40 p-4 shadow-[var(--shadow-glow)]"
        >
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            <Megaphone className="size-4 text-primary" /> Seja bem-vindo,{" "}
            {(perfil?.nome ?? "Irmão(ã)").split(" ")[0]}!
          </div>
          {aviso ? (
            <>
              <h2 className="mt-2 max-w-[80%] font-display text-2xl font-bold leading-snug text-background">
                {aviso.titulo}
              </h2>
              <p className="mt-1 max-w-[85%] text-sm text-background/90">{aviso.descricao}</p>
              <p className="mt-2 text-xs font-medium text-primary">
                {aviso.autor} · {dataAvisoBR(aviso)} · toque para ver detalhes
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-background/90">Nenhum aviso fixado no momento.</p>
          )}
          <Cross className="absolute -right-3 bottom-0 size-24 text-primary opacity-30" strokeWidth={1.2} />
        </Link>
      </section>


      <section className="grid grid-cols-2 gap-3 px-5 py-5">
        {botoes.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="action-gradient flex flex-col items-center gap-2 rounded-2xl border border-primary/35 px-3 py-5 text-center shadow-[var(--shadow-soft)] transition-transform active:scale-95"
          >
            <span className="flex size-14 items-center justify-center rounded-full border-2 border-primary/70 bg-primary/10">
              <Icon className="size-7 text-primary" strokeWidth={1.8} />
            </span>
            <span className="text-sm font-medium uppercase tracking-wide text-background">{label}</span>
            <span className="h-0.5 w-7 bg-primary" />
          </Link>
        ))}
      </section>

      <section className="px-5 pb-6">
        <div className="surface-card overflow-hidden border-primary/20">
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CalendarCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg leading-tight">Cultos &amp; Horários</h2>
              <p className="text-xs text-soft">Venha adorar e crescer conosco!</p>
            </div>
          </div>
          <ul className="divide-y divide-border border-t border-border">
            {cultos.length === 0 ? (
              <li className="px-4 py-3.5 text-sm text-soft">Nenhum culto agendado.</li>
            ) : null}
            {cultos.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide">{c.dia}</p>
                  <p className="text-xs text-soft">{c.tema}</p>
                </div>
                <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-bold text-primary">
                  {c.horario}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
