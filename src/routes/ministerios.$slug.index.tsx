import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Guitar,
  HandHeart,
  HeartHandshake,
  Lock,
  Megaphone,
  Music2,
  Music4,
  Pin,
  type LucideIcon,
} from "lucide-react";

import { AppShell, BackButton } from "@/components/AppShell";
import { ministerios } from "@/lib/church-data";
import { BloqueioMinisterio } from "@/components/BloqueioMinisterio";
import { usePerfil } from "@/hooks/usePerfil";
import { motivoBloqueio, podeVerMinisterio, type SlugMinisterio } from "@/lib/permissoes";
import { listarAvisosMin, useLista, type AvisoMinDB } from "@/lib/ministerio-db";
import { ministeriosConteudo, type SecaoKey } from "@/lib/ministerio-data";
import heroJovens from "@/assets/hero-jovens.jpg";
import heroIrmas from "@/assets/hero-irmas.jpg";
import heroLouvor from "@/assets/hero-louvor.jpg";

export const Route = createFileRoute("/ministerios/$slug/")({
  head: () => ({
    meta: [
      { title: "Ministério — IPR" },
      { name: "description", content: "Área interna do ministério com tema, avisos e botões próprios." },
      { property: "og:title", content: "Ministério — IPR" },
      { property: "og:description", content: "Área interna do ministério." },
    ],
  }),
  component: MinisterioPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="p-6">Ministério não encontrado</div>
    </AppShell>
  ),
});

const icones: Record<SecaoKey, LucideIcon> = {
  ensaio: Music2,
  oracao: HandHeart,
  repertorio: Guitar,
  letras: BookOpen,
  cifras: Guitar,
  avisos: Megaphone,
  estudo: BookOpen,
  agenda: CalendarDays,
  visitas: HeartHandshake,
};

const heros = {
  jovens: heroJovens,
  irmas: heroIrmas,
  louvor: heroLouvor,
} as const;

const titulos = {
  jovens: { linha1: "MINISTÉRIO", destaque: "JOVENS", sub: "PARA CRISTO" },
  irmas: { linha1: "MINISTÉRIO DE", destaque: "IRMÃS", sub: "para Cristo" },
  louvor: { linha1: "MINISTÉRIO DE", destaque: "LOUVOR", sub: "IPR DO BRASIL" },
} as const;

function MinisterioPage() {
  const { permissao } = usePerfil();
  const { slug } = Route.useParams();
  const { lista: avisos } = useLista<AvisoMinDB>(() => listarAvisosMin(slug));
  const min = ministerios.find((m) => m.slug === slug);
  if (!min) throw notFound();
  const conteudo = ministeriosConteudo[min.slug];
  const titulo = titulos[min.slug];

  const temAcesso = podeVerMinisterio(permissao, min.slug as SlugMinisterio);
  const fixado = (avisos ?? []).find((a) => a.fixado) ?? (avisos ?? [])[0] ?? null;

  return (
    <AppShell theme={min.slug}>
      <div className="relative">
        <img
          src={heros[min.slug]}
          alt={`Capa do ${conteudo.nome}`}
          width={1024}
          height={1024}
          className="h-[300px] w-full object-contain object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/25 to-background" />

        <div
          className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4"
          style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <BackButton />
          <Bell className="size-5 text-primary" />
        </div>


        <div className="absolute inset-x-0 top-14 px-5 text-center">
          <p className="text-[11px] font-semibold tracking-[0.35em] text-foreground/80">
            {titulo.linha1}
          </p>
          <h1 className="font-display text-5xl leading-none tracking-tight text-primary drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]">
            {titulo.destaque}
          </h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.3em] text-foreground/85">
            {titulo.sub}
          </p>
          <span className="mx-auto mt-3 block h-0.5 w-12 bg-primary" />
        </div>
      </div>

      <div className="space-y-5 px-5 pb-6 pt-[90px] md:pt-[100px]" style={{ paddingTop: "calc(90px + env(safe-area-inset-top))" }}>
        {fixado ? (
          <div className="surface-card sticky top-2 z-30 border-primary/40 p-4 shadow-[var(--shadow-glow)]">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Pin className="size-3.5" /> Aviso em destaque
            </p>
            <p className="mt-1 font-display text-lg">{fixado.titulo}</p>
            <p className="mt-1 text-sm">{fixado.texto}</p>
            <p className="mt-2 text-xs text-soft">
              {fixado.autor_nome || "Liderança"} ·{" "}
              {new Date(fixado.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        ) : null}

        {conteudo.frase ? (
          <div className="surface-card px-4 py-3 text-center text-sm italic">{conteudo.frase}</div>
        ) : null}

        {temAcesso ? (
          <div className="grid grid-cols-2 gap-3">
            {conteudo.secoes.map((s) => {
              const Icon = icones[s.key];
              return (
                <Link
                  key={s.key}
                  to="/ministerios/$slug/$secao"
                  params={{ slug: min.slug, secao: s.key }}
                  className="surface-card flex flex-col items-center gap-2 px-3 py-5 text-center transition-transform active:scale-95"
                >
                  <span className="flex size-14 items-center justify-center rounded-full border-2 border-accent/60 bg-accent/10">
                    <Icon className="size-7 text-accent" strokeWidth={1.8} />
                  </span>
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {s.label}
                    {s.restrito ? <Lock className="ml-1 inline size-3.5 text-primary" /> : null}
                  </span>
                  <span className="h-0.5 w-7 bg-primary" />
                </Link>
              );
            })}
          </div>
        ) : (
          <BloqueioMinisterio
            slug={min.slug as SlugMinisterio}
            motivo={motivoBloqueio(permissao)}
          />
        )}

        <div className="surface-card px-4 py-5 text-center">
          <Music4 className="mx-auto mb-2 size-5 text-primary" />
          <p className="text-sm italic leading-relaxed">{conteudo.versiculo}</p>
          <p className="mt-2 text-xs text-soft">Líder: {conteudo.lider}</p>
        </div>
      </div>
    </AppShell>
  );
}
