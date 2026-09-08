import { Maximize2, Minimize2, Minus, Plus, Type } from "lucide-react";
import { useMemo, useState } from "react";

import type { Cifra } from "@/lib/ministerio-data";
import { transposeChordLine, transposeNote } from "@/lib/transpose";

/** Reconhece A, Am, D7, E/G#, F#m, C/E, D/F#, Gsus4, Bbmaj7, etc. */
const CHORD_RE =
  /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|M)?[0-9]*(sus[24]|add[0-9]+|maj[0-9]+|dim[0-9]*|aug)?[0-9]*(\([^)]*\))?(\/[A-G][#b]?)?$/;

function isChordToken(token: string) {
  return CHORD_RE.test(token.trim());
}

type Token = { text: string; col: number };

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) tokens.push({ text: m[0], col: m.index });
  return tokens;
}

function placeAt(target: string, col: number, text: string) {
  const base = target.length < col ? target + " ".repeat(col - target.length) : target;
  return base + (base.length > col ? " " : "") + text;
}

/**
 * Converte texto bruto de cifra em linhas { acordes, letra }.
 * - Linha só com acordes -> junta com a próxima linha de letra
 * - Linha com acordes + letra misturados -> separa em duas faixas alinhadas
 * - Linha só de letra -> acordes vazio
 */
export function parseCifraTexto(texto: string): { acordes: string; letra: string }[] {
  const linhas = texto.replace(/\r\n?/g, "\n").split("\n");
  const resultado: { acordes: string; letra: string }[] = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i] ?? "";
    const tokens = tokenize(linha);

    if (tokens.length === 0) {
      resultado.push({ acordes: "", letra: "" });
      continue;
    }

    const chordCount = tokens.filter((t) => isChordToken(t.text)).length;

    // 1) Linha só de acordes -> usa a próxima linha como letra
    if (chordCount === tokens.length) {
      const proxima = linhas[i + 1];
      const proximaTokens = proxima ? tokenize(proxima) : [];
      const proximaEhLetra =
        proximaTokens.length > 0 &&
        proximaTokens.some((t) => !isChordToken(t.text));

      if (proximaEhLetra) {
        resultado.push({ acordes: linha, letra: proxima ?? "" });
        i++;
      } else {
        resultado.push({ acordes: linha, letra: "" });
      }
      continue;
    }

    // 2) Linha só de letra
    if (chordCount === 0) {
      resultado.push({ acordes: "", letra: linha });
      continue;
    }

    // 3) Acordes e letra misturados na mesma linha -> separa alinhado
    let acordes = "";
    let letra = "";
    for (const t of tokens) {
      if (isChordToken(t.text)) acordes = placeAt(acordes, t.col, t.text);
      else letra = placeAt(letra, t.col, t.text);
    }
    resultado.push({ acordes, letra });
  }

  // remove linhas vazias no fim
  while (resultado.length && !resultado[resultado.length - 1].acordes && !resultado[resultado.length - 1].letra) {
    resultado.pop();
  }

  return resultado;
}

/** Aceita linhas já estruturadas, string bruta, ou array de strings. */
function normalizarLinhas(linhas: unknown): { acordes: string; letra: string }[] {
  if (typeof linhas === "string") return parseCifraTexto(linhas);

  if (Array.isArray(linhas)) {
    // já estruturado -> não mexe (não quebra o que funciona)
    const estruturado = linhas.every(
      (l) => l && typeof l === "object" && ("acordes" in l || "letra" in l),
    );
    if (estruturado) {
      return (linhas as { acordes?: string; letra?: string }[]).map((l) => ({
        acordes: l.acordes ?? "",
        letra: l.letra ?? "",
      }));
    }
    if (linhas.every((l) => typeof l === "string")) {
      return parseCifraTexto((linhas as string[]).join("\n"));
    }
  }

  return [];
}

export function CifraViewer({ cifra }: { cifra: Cifra }) {
  const [semitons, setSemitons] = useState(0);
  const [bemol, setBemol] = useState(false);
  const [fonte, setFonte] = useState(14);
  const [cheia, setCheia] = useState(false);

  const tomAtual = transposeNote(cifra.tom, semitons, bemol);
  const linhas = useMemo(() => normalizarLinhas(cifra.linhas as unknown), [cifra.linhas]);

  return (
    <div
      className={
        cheia ? "fixed inset-0 z-50 overflow-auto bg-background p-4" : "surface-card p-4"
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
        {linhas.map((l, i) => (
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

