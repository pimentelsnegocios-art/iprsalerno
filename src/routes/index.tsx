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
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { avisos, cultos, usuarioAtual } from "@/lib/church-data";

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
  { to: "/agenda", label: "Agenda", Icon: CalendarDays },
  { to: "/oracao", label: "Oração", Icon: HandHeart },
  { to: "/estudo", label: "Estudo", Icon: BookOpen },
  { to: "/ministerios", label: "Ministérios", Icon: Landmark },
  { to: "/perfil", label: "Meu Perfil", Icon: User },
  { to: "/pastoral", label: "Acesso Pastoral", Icon: MessageSquareLock },
] as const;

function Home() {
  const aviso = avisos[0]!;

  return (
    <AppShell>
      <header className="header-gradient px-5 pt-10 pb-7 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <Cross className="size-7" strokeWidth={2.2} />
        </div>
        <h1 className="mt-3 font-display text-2xl leading-tight">
          Igreja Presbiteriana Renovada
        </h1>
        <p className="mt-2 text-sm text-soft">A paz do Senhor,</p>
        <p className="text-lg font-semibold text-primary">{usuarioAtual.nome}</p>
      </header>

      <section className="px-5 -mt-3">
        <Link
          to="/avisos"
          className="block rounded-2xl bg-primary p-4 text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Megaphone className="size-4" /> Avisos da Igreja
          </div>
          <h2 className="mt-2 font-display text-xl leading-snug">{aviso.titulo}</h2>
          <p className="mt-1 text-sm opacity-90">{aviso.texto}</p>
          <p className="mt-2 text-xs font-medium opacity-75">
            {aviso.autor} · {aviso.data} · toque para ver detalhes
          </p>
        </Link>
      </section>

      <section className="grid grid-cols-3 gap-3 px-5 py-6">
        {botoes.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="surface-card flex aspect-square flex-col items-center justify-center gap-2 px-2 text-center transition-transform active:scale-95"
          >
            <Icon className="size-7 text-primary" strokeWidth={1.8} />
            <span className="text-xs font-semibold leading-tight">{label}</span>
          </Link>
        ))}
      </section>

      <section className="px-5 pb-6">
        <h2 className="mb-3 font-display text-xl">Agenda Semanal</h2>
        <ul className="surface-card divide-y divide-border">
          {cultos.map((c) => (
            <li key={c.slug} className="flex items-center justify-between px-4 py-3.5">
              <span className="font-medium">{c.dia}</span>
              <span className="text-primary font-semibold">{c.horario}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
