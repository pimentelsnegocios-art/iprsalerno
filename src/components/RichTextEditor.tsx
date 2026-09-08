import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";

import { CORES_TEXTO, sanitizarHtml } from "@/lib/estudos-biblicos";

interface Props {
  valor: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const botaoBase =
  "flex size-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:scale-95";

export function RichTextEditor({ valor, onChange, placeholder, minHeight = 220 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [vazio, setVazio] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== valor) el.innerHTML = valor || "";
    setVazio(!el.textContent?.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitir = () => {
    const el = ref.current;
    if (!el) return;
    setVazio(!el.textContent?.trim());
    onChange(sanitizarHtml(el.innerHTML));
  };

  const comando = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, arg);
    emitir();
  };

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-2">
        <button
          type="button"
          aria-label="Negrito"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => comando("bold")}
          className={`${botaoBase} font-bold`}
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Itálico"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => comando("italic")}
          className={botaoBase}
        >
          <Italic className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Sublinhado"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => comando("underline")}
          className={botaoBase}
        >
          <Underline className="size-4" />
        </button>

        <span className="mx-1 h-6 w-px bg-border" />

        {CORES_TEXTO.map((c) => (
          <button
            key={c.nome}
            type="button"
            aria-label={`Cor ${c.nome}`}
            title={c.nome}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => comando("foreColor", c.valor || "inherit")}
            className="size-9 rounded-full border-2 border-border"
            style={
              c.valor
                ? { backgroundColor: c.valor }
                : { background: "linear-gradient(135deg,var(--muted),transparent)" }
            }
          />
        ))}
      </div>

      <div className="relative">
        {vazio && placeholder ? (
          <span className="pointer-events-none absolute left-4 top-3 text-sm text-soft">
            {placeholder}
          </span>
        ) : null}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Conteúdo do estudo"
          onInput={emitir}
          onBlur={emitir}
          onPaste={(e) => {
            e.preventDefault();
            const texto = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, texto);
          }}
          className="rich-text w-full px-4 py-3 text-[15px] leading-relaxed outline-none"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}

export function RichTextView({ html, className = "" }: { html: string; className?: string }) {
  const [limpo, setLimpo] = useState("");
  useEffect(() => setLimpo(sanitizarHtml(html)), [html]);
  return (
    <div
      className={`rich-text text-[15px] leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: limpo }}
    />
  );
}
