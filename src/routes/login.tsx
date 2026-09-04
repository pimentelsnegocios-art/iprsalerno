import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Cross, Lock, Mail } from "lucide-react";
import { useState } from "react";

import dove from "@/assets/dove.png";
import { useAppStore } from "@/lib/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Família IPRB Renovada" },
      { name: "description", content: "Acesse sua conta da Igreja Presbiteriana Renovada." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { membros } = useAppStore();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [recuperarEnviado, setRecuperarEnviado] = useState(false);

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha seu e-mail e senha para continuar.");
      return;
    }
    const membro = membros.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
    if (!membro) {
      setErro("Não encontramos esse e-mail. Verifique ou crie sua conta.");
      return;
    }
    if (membro.status === "pendente") {
      setErro("Seu cadastro ainda está em aprovação pela liderança. Em breve você entra!");
      return;
    }
    if (membro.status === "bloqueado") {
      setErro("Seu acesso está bloqueado. Fale com a liderança da igreja.");
      return;
    }
    toast.success(`Bem-vindo de volta, ${membro.nome.split(" ")[0]}!`);
    navigate({ to: "/" });
  }

  function enviarRecuperacao(e: React.FormEvent) {
    e.preventDefault();
    if (!emailRecuperar.trim()) return;
    setRecuperarEnviado(true);
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-b from-[#F8F5F0] to-[#E8E0D5] px-4 py-10">
      <img
        src={dove}
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-4 top-8 w-40 opacity-10 md:right-24 md:w-64"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-black/5 md:p-9">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A5F]">
            <Cross className="h-7 w-7 text-[#D4B678]" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-[#1E3A5F]">
            Bem-vindo à Família IPRB Renovada
          </h1>
          <p className="mt-1 text-sm text-[#1E3A5F]/60">Que bom ter você aqui</p>
        </div>

        <form onSubmit={entrar} className="mt-7 space-y-4">
          <label className="flex items-center gap-3 rounded-2xl border border-[#1E3A5F]/10 bg-[#F8F5F0] px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-[#B89B5E]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="w-full bg-transparent text-sm text-[#1E3A5F] outline-none placeholder:text-[#1E3A5F]/40"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-[#1E3A5F]/10 bg-[#F8F5F0] px-4 py-3">
            <Lock className="h-4 w-4 shrink-0 text-[#B89B5E]" />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              className="w-full bg-transparent text-sm text-[#1E3A5F] outline-none placeholder:text-[#1E3A5F]/40"
            />
          </label>

          {erro && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-700">{erro}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#1E3A5F] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1E3A5F]/90"
          >
            Entrar
          </button>
        </form>

        <button
          onClick={() => {
            setRecuperarEnviado(false);
            setEmailRecuperar(email);
            setModalRecuperar(true);
          }}
          className="mt-4 w-full text-center text-xs font-medium text-[#B89B5E] hover:underline"
        >
          Esqueceu a senha?
        </button>

        <p className="mt-5 text-center text-xs text-[#1E3A5F]/60">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-[#1E3A5F] hover:underline">
            Cadastre-se
          </Link>
        </p>

        <p className="mt-6 border-t border-[#1E3A5F]/10 pt-4 text-center text-[11px] italic text-[#1E3A5F]/50">
          "Assim como nos acolhestes, acolhei-vos uns aos outros" — Romanos 15:7
        </p>
      </div>

      {modalRecuperar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            {recuperarEnviado ? (
              <div className="text-center">
                <h2 className="font-serif text-lg font-semibold text-[#1E3A5F]">Link enviado!</h2>
                <p className="mt-2 text-sm text-[#1E3A5F]/60">
                  Se esse e-mail estiver cadastrado, você receberá um link para criar uma nova
                  senha.
                </p>
                <button
                  onClick={() => setModalRecuperar(false)}
                  className="mt-5 w-full rounded-2xl bg-[#1E3A5F] py-3 text-sm font-semibold text-white"
                >
                  Entendi
                </button>
              </div>
            ) : (
              <form onSubmit={enviarRecuperacao}>
                <h2 className="font-serif text-lg font-semibold text-[#1E3A5F]">
                  Recuperar senha
                </h2>
                <p className="mt-1 text-sm text-[#1E3A5F]/60">
                  Digite seu e-mail e enviaremos um link de recuperação.
                </p>
                <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[#1E3A5F]/10 bg-[#F8F5F0] px-4 py-3">
                  <Mail className="h-4 w-4 shrink-0 text-[#B89B5E]" />
                  <input
                    type="email"
                    value={emailRecuperar}
                    onChange={(e) => setEmailRecuperar(e.target.value)}
                    placeholder="Seu e-mail"
                    className="w-full bg-transparent text-sm text-[#1E3A5F] outline-none placeholder:text-[#1E3A5F]/40"
                  />
                </label>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalRecuperar(false)}
                    className="flex-1 rounded-2xl border border-[#1E3A5F]/15 py-3 text-sm font-medium text-[#1E3A5F]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-[#1E3A5F] py-3 text-sm font-semibold text-white"
                  >
                    Enviar link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
