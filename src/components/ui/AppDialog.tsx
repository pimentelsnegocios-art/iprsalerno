import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PromptReq = {
  kind: "prompt";
  label: string;
  valor: string;
  resolve: (v: string | null) => void;
};
type ConfirmReq = { kind: "confirm"; label: string; resolve: (v: boolean) => void };
type Req = PromptReq | ConfirmReq;

let push: ((r: Req) => void) | null = null;

export function appPrompt(label: string, valorInicial?: string | null): Promise<string | null> {
  if (!push) return Promise.resolve(null);
  return new Promise((resolve) =>
    push!({ kind: "prompt", label, valor: valorInicial ?? "", resolve }),
  );
}

export function appConfirm(label: string): Promise<boolean> {
  if (!push) return Promise.resolve(false);
  return new Promise((resolve) => push!({ kind: "confirm", label, resolve }));
}

const ehLongo = (label: string, valor: string) =>
  valor.includes("\n") ||
  /conte|letra|resposta|observa|texto|partes|pedido|resumo|curiosidade|descri/i.test(label);

export function AppDialogHost() {
  const [req, setReq] = useState<Req | null>(null);
  const [valor, setValor] = useState("");

  useEffect(() => {
    push = (r) => {
      setReq(r);
      setValor(r.kind === "prompt" ? r.valor : "");
    };
    return () => {
      push = null;
    };
  }, []);

  const fechar = () => setReq(null);

  if (!req) return null;

  if (req.kind === "confirm") {
    return (
      <AlertDialog
        open
        onOpenChange={(o) => {
          if (!o) {
            req.resolve(false);
            fechar();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar</AlertDialogTitle>
            <AlertDialogDescription>{req.label}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                req.resolve(false);
                fechar();
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                req.resolve(true);
                fechar();
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const longo = ehLongo(req.label, req.valor);

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) {
          req.resolve(null);
          fechar();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{req.label}</DialogTitle>
        </DialogHeader>
        {longo ? (
          <Textarea rows={8} value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
        ) : (
          <Input value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
        )}
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              req.resolve(null);
              fechar();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              req.resolve(valor);
              fechar();
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
