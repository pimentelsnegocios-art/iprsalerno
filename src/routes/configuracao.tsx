import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/AppShell";
import { usePerfil } from "@/hooks/usePerfil";
import { useConfigIgreja } from "@/hooks/useConfigIgreja";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/configuracao")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configuração da Igreja — IPRB Renovada" },
      {
        name: "description",
        content:
          "Dados oficiais da igreja: nome, CNPJ, endereço e chave PIX usados em todo o aplicativo.",
      },
      { property: "og:title", content: "Configuração da Igreja — IPRB Renovada" },
      {
        property: "og:description",
        content: "Atualize nome, endereço e chave PIX oficiais da igreja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Configuracao,
});

const campo =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary";

function Configuracao() {
  const { permissao, carregando: carregandoPerfil } = usePerfil();
  const { config, carregando, recarregar } = useConfigIgreja();
  const [form, setForm] = useState(config);
  const [salvando, setSalvando] = useState(false);

  const autorizado = ["Fundador", "Admin"].includes(permissao.cargo);

  useEffect(() => {
    setForm(config);
  }, [config]);

  if (carregandoPerfil || carregando) {
    return (
      <AppShell>
        <PageHeader title="Configuração da Igreja" subtitle="Carregando…" />
      </AppShell>
    );
  }

  if (!autorizado) {
    return (
      <AppShell>
        <PageHeader
          title="Configuração da Igreja"
          subtitle="Área restrita"
          back
         
        />
        <div className="px-5 py-6">
          <div className="surface-card p-5 text-sm text-soft">
            Esta área é exclusiva do Fundador e dos Administradores da igreja.
          </div>
        </div>
      </AppShell>
    );
  }

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome da igreja.");
      return;
    }
    if (!form.pix_chave.trim()) {
      toast.error("Informe a chave PIX oficial.");
      return;
    }
    setSalvando(true);
    const valores = {
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      endereco: form.endereco.trim(),
      mapa_url: form.mapa_url.trim(),
      pix_chave: form.pix_chave.trim(),
      pix_tipo: form.pix_tipo.trim() || "E-mail",
      pix_banco: form.pix_banco.trim(),
    };
    const { error } = form.id
      ? await supabase.from("configuracao_igreja").update(valores).eq("id", form.id)
      : await supabase.from("configuracao_igreja").insert(valores);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar. Tente novamente.");
      return;
    }
    toast.success("Dados da igreja atualizados!");
    void recarregar();
  }

  return (
    <AppShell>
      <PageHeader
        title="Configuração da Igreja"
        subtitle="Nome, CNPJ, endereço e chave PIX oficiais"
       
      />
      <div className="space-y-4 px-5 py-5">
        <div className="surface-card flex items-center gap-3 p-4 text-sm text-soft">
          <Settings className="size-5 shrink-0 text-primary" />
          Estes dados aparecem na tela inicial e na tela PIX da Igreja para todos os
          membros.
        </div>

        <div className="surface-card space-y-3 p-4">
          <label className="block text-xs font-semibold text-soft">
            Nome da Igreja *
            <input
              className={campo}
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-soft">
            CNPJ (opcional)
            <input
              className={campo}
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              placeholder="00.000.000/0001-00"
            />
          </label>
          <label className="block text-xs font-semibold text-soft">
            Endereço completo
            <textarea
              className={campo}
              rows={2}
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-soft">
            Link do mapa (opcional)
            <input
              className={campo}
              value={form.mapa_url}
              onChange={(e) => setForm({ ...form, mapa_url: e.target.value })}
            />
          </label>
        </div>

        <div className="surface-card space-y-3 p-4">
          <p className="font-semibold">PIX oficial</p>
          <label className="block text-xs font-semibold text-soft">
            Chave PIX *
            <input
              className={campo}
              value={form.pix_chave}
              onChange={(e) => setForm({ ...form, pix_chave: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-soft">
            Tipo da chave
            <input
              className={campo}
              value={form.pix_tipo}
              onChange={(e) => setForm({ ...form, pix_tipo: e.target.value })}
              placeholder="E-mail, CNPJ, Celular…"
            />
          </label>
          <label className="block text-xs font-semibold text-soft">
            Banco
            <input
              className={campo}
              value={form.pix_banco}
              onChange={(e) => setForm({ ...form, pix_banco: e.target.value })}
            />
          </label>
        </div>

        <button
          onClick={() => void salvar()}
          disabled={salvando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Save className="size-4" />
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </AppShell>
  );
}
