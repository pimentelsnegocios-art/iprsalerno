import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Cross, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha — IPRB Renovada" },
      { name: "description", content: "Crie uma nova senha para sua conta da igreja." },
      { property: "og:title", content: "Nova senha — IPRB Renovada" },
      { property: "og:description", content: "Defina uma nova senha de acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro("O link expirou. Peça um novo link de recuperação na tela de login.");
      return;
    }
    toast.success("Senha atualizada! Você já pode entrar.");
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-[#F8F5F0] to-[#E8E0D5] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-black/5">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A5F]">
            <Cross className="h-7 w-7 text-[#D4B678]" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-[#1E3A5F]">Criar nova senha</h1>
          <p className="mt-1 text-sm text-[#1E3A5F]/60">Escolha uma senha que você lembre</p>
        </div>
        <form onSubmit={salvar} className="mt-7 space-y-4">
          {[
            ["Nova senha", senha, setSenha] as const,
            ["Confirmar nova senha", confirmar, setConfirmar] as const,
          ].map(([label, valor, set]) => (
            <label
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-[#1E3A5F]/10 bg-[#F8F5F0] px-4 py-3"
            >
              <Lock className="h-4 w-4 shrink-0 text-[#B89B5E]" />
              <input
                type="password"
                value={valor}
                onChange={(e) => set(e.target.value)}
                placeholder={label}
                className="w-full bg-transparent text-sm text-[#1E3A5F] outline-none placeholder:text-[#1E3A5F]/40"
              />
            </label>
          ))}
          {erro && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-700">{erro}</p>}
          <button className="w-full rounded-2xl bg-[#1E3A5F] py-3.5 text-sm font-semibold text-white">
            Salvar nova senha
          </button>
        </form>
      </div>
    </div>
  );
}
