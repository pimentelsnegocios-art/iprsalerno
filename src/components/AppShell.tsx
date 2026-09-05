import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Book, CalendarDays, Sun, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

const cultoTabs = [
  { dia: "quinta", label: "Quinta", Icon: Book },
  { dia: "sabado", label: "Sábado", Icon: CalendarDays },
  { dia: "domingo", label: "Domingo", Icon: Sun },
] as const;

const linkClass = (active: boolean) =>
  `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
    active ? "text-primary" : "text-soft"
  }`;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-popover/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch">
        <Link to="/" className={linkClass(pathname === "/")}>
          <Home className="size-5" strokeWidth={pathname === "/" ? 2.4 : 1.8} />
          Início
        </Link>
        {cultoTabs.map(({ dia, label, Icon }) => {
          const active = pathname === `/culto/${dia}`;
          return (
            <Link key={dia} to="/culto/$dia" params={{ dia }} className={linkClass(active)}>
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
        <Link to="/mais" className={linkClass(pathname === "/mais")}>
          <MoreHorizontal className="size-5" strokeWidth={pathname === "/mais" ? 2.4 : 1.8} />
          Mais
        </Link>
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
      className={`inline-flex items-center gap-1.5 rounded-xl border border-border bg-popover/70 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur ${className}`}
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
