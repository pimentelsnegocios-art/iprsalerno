import { useEffect, useState } from "react";

import { cultos as cultosIniciais, type Culto } from "./church-data";

export const AGENDA_KEY = "igreja_agenda_cultos";
const EVENTO = "igreja_agenda_cultos_change";

export function carregarCultos(): Culto[] {
  if (typeof window === "undefined") return cultosIniciais;
  try {
    const raw = window.localStorage.getItem(AGENDA_KEY);
    if (!raw) return cultosIniciais;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return cultosIniciais;
    return parsed as Culto[];
  } catch {
    return cultosIniciais;
  }
}

export function salvarCultos(lista: Culto[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AGENDA_KEY, JSON.stringify(lista));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Lê os cultos da agenda e mantém sincronizado entre telas e abas. */
export function useCultos(): Culto[] {
  const [lista, setLista] = useState<Culto[]>(cultosIniciais);

  useEffect(() => {
    const atualizar = () => setLista(carregarCultos());
    atualizar();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === AGENDA_KEY) atualizar();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENTO, atualizar);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENTO, atualizar);
    };
  }, []);

  return lista;
}
