import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, CalendarDays, Music, Church, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { dia: "quinta", label: "Quinta", Icon: CalendarDays },
  { dia: "sabado", label: "Sábado", Icon: Music },
  { dia: "domingo", label: "Domingo", Icon: Church },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-popover/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-stretch">
        {tabs.map(({ dia, label, Icon }) => {
          const active = pathname === `/culto/${dia}`;
          return (
            <Link
              key={dia}
              to="/culto/$dia"
              params={{ dia }}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-soft"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
        <Link
          to="/mais"
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
            pathname === "/mais" ? "text-primary" : "text-soft"
          }`}
        >
          <MoreHorizontal className="size-5" />
          Mais
        </Link>
      </div>
    </nav>
  );
}


export function PageHeader({
  title,
  subtitle,
  back = "/",
}: {
  title: string;
  subtitle?: string;
  back?: string;
}) {
  return (
    <header className="header-gradient px-5 pt-8 pb-6">
      <Link to={back} className="mb-3 inline-flex items-center gap-1 text-sm text-soft">
        <ChevronLeft className="size-4" /> Voltar
      </Link>
      <h1 className="font-display text-3xl leading-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-soft">{subtitle}</p> : null}
    </header>
  );
}

export function AppShell({
  children,
  theme,
}: {
  children: ReactNode;
  theme?: "louvor" | "jovens" | "irmas";
}) {
  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-background text-foreground transition-colors"
    >
      <div className="mx-auto max-w-lg pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="px-5 py-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
