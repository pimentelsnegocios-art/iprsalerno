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
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { cultos, usuarioAtual } from "@/lib/church-data";
import { useAppStore } from "@/lib/app-store";


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
  const { avisos } = useAppStore();
  const aviso = avisos.find((a) => a.fixadoHome) ?? avisos[0];


  return (
    <AppShell>
      <header className="header-gradient px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/50 text-primary">
            <Cross className="size-6" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-soft">IGREJA</p>
            <h1 className="font-display text-lg leading-tight">
              Presbiteriana <span className="text-primary">Renovada</span>
            </h1>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-1.5 border-l-2 border-primary/60 pl-2.5 text-xs text-soft">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
          Rua José Finoteli, 730 — Città di Salerno (Jardim Explanada), Campinas / SP
        </p>
      </header>

      <section className="px-5 pt-4">
        <Link
          to="/avisos"
          className="relative block overflow-hidden rounded-2xl border border-primary bg-background p-4 text-foreground shadow-[var(--shadow-glow)]"
        >
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
            <Megaphone className="size-4 text-primary" /> Seja bem-vindo,{" "}
            {usuarioAtual.nome.split(" ")[0]}!
          </div>
          {aviso ? (
            <>
              <h2 className="mt-2 max-w-[80%] font-display text-xl font-bold leading-snug text-foreground">
                {aviso.titulo}
              </h2>
              <p className="mt-1 max-w-[85%] text-sm text-foreground/80">{aviso.texto}</p>
              <p className="mt-2 text-xs font-medium text-foreground/80">
                {aviso.autor} · {aviso.data} · toque para ver detalhes
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-foreground/80">Nenhum aviso fixado no momento.</p>
          )}
          <Cross className="absolute -right-3 bottom-0 size-24 text-primary opacity-15" strokeWidth={1.2} />
        </Link>
      </section>


      <section className="grid grid-cols-2 gap-3 px-5 py-5">
        {botoes.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="surface-card flex flex-col items-center gap-2 px-3 py-5 text-center transition-transform active:scale-95"
          >
            <span className="flex size-14 items-center justify-center rounded-full border-2 border-primary/70 bg-primary/10">
              <Icon className="size-7 text-primary" strokeWidth={1.8} />
            </span>
            <span className="text-sm font-medium uppercase tracking-wide">{label}</span>
            <span className="h-0.5 w-7 bg-primary" />
          </Link>
        ))}
      </section>

      <section className="px-5 pb-6">
        <div className="surface-card overflow-hidden">
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
            {cultos.map((c) => (
              <li key={c.slug} className="flex items-center justify-between gap-3 px-4 py-3.5">
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
