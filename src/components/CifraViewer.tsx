import { Maximize2, Minimize2, Minus, Plus, Type } from "lucide-react";
import { useState } from "react";

import type { Cifra } from "@/lib/ministerio-data";
import { transposeChordLine, transposeNote } from "@/lib/transpose";

export function CifraViewer({ cifra }: { cifra: Cifra }) {
  const [semitons, setSemitons] = useState(0);
  const [bemol, setBemol] = useState(false);
  const [fonte, setFonte] = useState(14);
  const [cheia, setCheia] = useState(false);

  const tomAtual = transposeNote(cifra.tom, semitons, bemol);

  return (
    <div
      className={
        cheia
          ? "fixed inset-0 z-50 overflow-auto bg-background p-4"
          : "surface-card p-4"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg">{cifra.titulo}</h3>
          <p className="text-xs text-soft">{cifra.artista}</p>
        </div>
        <span className="rounded-lg bg-primary px-2.5 py-1 text-sm font-bold text-primary-foreground">
          Tom {tomAtual}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setSemitons((s) => s - 1)}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5"
        >
          <Minus className="size-3.5" /> ½ tom
        </button>
        <button
          onClick={() => setSemitons((s) => s + 1)}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5"
        >
          <Plus className="size-3.5" /> ½ tom
        </button>
        <button
          onClick={() => setBemol((b) => !b)}
          className="rounded-lg border border-border px-2.5 py-1.5"
        >
          {bemol ? "♭ bemol" : "♯ sustenido"}
        </button>
        <button
          onClick={() => setFonte((f) => (f >= 22 ? 12 : f + 2))}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5"
        >
          <Type className="size-3.5" /> {fonte}px
        </button>
        <button
          onClick={() => setCheia((c) => !c)}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5"
        >
          {cheia ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          {cheia ? "Sair" : "Tela cheia"}
        </button>
        {semitons !== 0 ? (
          <button onClick={() => setSemitons(0)} className="text-primary underline">
            tom original
          </button>
        ) : null}
      </div>

      <pre
        className="mt-4 overflow-x-auto font-mono leading-tight"
        style={{ fontSize: `${fonte}px` }}
      >
        {cifra.linhas.map((l, i) => (
          <span key={i}>
            <span className="font-bold text-primary">
              {transposeChordLine(l.acordes, semitons, bemol)}
            </span>
            {"\n"}
            {l.letra}
            {"\n\n"}
          </span>
        ))}
      </pre>
    </div>
  );
}
