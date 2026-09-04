import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Book, CalendarDays, Sun, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Início", Icon: Home, match: (p: string) => p === "/" },
  { to: "/culto/quinta", label: "Quinta", Icon: Book, match: (p: string) => p === "/culto/quinta" },
  { to: "/culto/sabado", label: "Sábado", Icon: CalendarDays, match: (p: string) => p === "/culto/sabado" },
  { to: "/culto/domingo", label: "Domingo", Icon: Sun, match: (p: string) => p === "/culto/domingo" },
  { to: "/mais", label: "Mais", Icon: MoreHorizontal, match: (p: string) => p === "/mais" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-popover/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch">
        {tabs.map(({ to, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-soft"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header
      className="header-gradient px-5 pb-6"
      style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}
    >
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
