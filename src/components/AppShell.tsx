import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Home, CalendarDays, HandHeart, User, MoreHorizontal, ChevronLeft } from "lucide-react";

import type { ReactNode } from "react";

const navItens = [
  { to: "/", label: "Início", Icon: Home, match: (p: string) => p === "/" },
  { to: "/cultos", label: "Cultos", Icon: CalendarDays, match: (p: string) => p.startsWith("/culto") },
  { to: "/pastoral", label: "Pastoral", Icon: HandHeart, match: (p: string) => p.startsWith("/pastoral") },
  { to: "/perfil", label: "Meu Perfil", Icon: User, match: (p: string) => p.startsWith("/perfil") },
  { to: "/mais", label: "Mais", Icon: MoreHorizontal, match: (p: string) => p.startsWith("/mais") },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="nav-gradient fixed inset-x-0 bottom-0 z-40 border-t border-primary/35 shadow-[0_-6px_20px_-16px_color-mix(in_oklab,var(--navy-deep)_45%,transparent)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch">
        {navItens.map(({ to, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-background/80"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
              <span
                className={`h-0.5 w-6 rounded-full transition-colors ${
                  active ? "bg-primary" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.history.back()}
      aria-label="Voltar"
      className={`inline-flex items-center gap-1.5 rounded-xl border border-primary/45 bg-background/10 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur ${className}`}
    >
      <ChevronLeft className="size-4" /> Voltar
    </button>
  );
}

export function PageHeader({
  title,
  subtitle,
  back = false,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  return (
    <header
      className="header-gradient px-5 pb-6"
      style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}
    >
      {back ? <BackButton className="mb-3" /> : null}
      <h1 className="font-display text-3xl leading-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-background/75">{subtitle}</p> : null}
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
      className="app-shell min-h-screen bg-background text-foreground transition-colors"
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
