import { FileText, X } from "lucide-react";

import { brlPix, rotuloMes, type Contribuicao } from "@/lib/pix-store";

const badgeStatus: Record<Contribuicao["status"], { texto: string; classe: string }> = {
  pendente: {
    texto: "⏳ Pendente",
    classe: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  confirmado: {
    texto: "✅ Confirmado",
    classe: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  },
  rejeitado: {
    texto: "❌ Não confirmado",
    classe: "bg-red-500/15 text-red-500 border-red-500/30",
  },
};

export function StatusBadge({ status }: { status: Contribuicao["status"] }) {
  const b = badgeStatus[status];
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${b.classe}`}>
      {b.texto}
    </span>
  );
}

export function VisualizadorComprovante({
  item,
  onClose,
}: {
  item: Contribuicao;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4">
      <div className="flex items-center justify-between text-white">
        <div>
          <p className="font-semibold">{item.tipo}</p>
          <p className="text-xs opacity-80">
            {rotuloMes(item.mesRef)} · {brlPix(item.valor)}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar" className="p-2">
          <X className="size-6" />
        </button>
      </div>
      <div className="mt-4 flex flex-1 items-center justify-center overflow-auto">
        {item.comprovanteTipo === "imagem" ? (
          <img
            src={item.comprovanteUrl}
            alt={`Comprovante de ${item.tipo} de ${rotuloMes(item.mesRef)}`}
            className="max-h-full w-auto max-w-full rounded-xl object-contain"
          />
        ) : (
          <a
            href={item.comprovanteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 text-white"
          >
            <FileText className="size-12" />
            <span className="text-sm underline">{item.comprovanteNome}</span>
          </a>
        )}
      </div>
      {item.status === "rejeitado" && item.motivo ? (
        <p className="mt-3 rounded-xl bg-red-500/20 p-3 text-sm text-red-200">
          Motivo: {item.motivo}
        </p>
      ) : null}
    </div>
  );
}
