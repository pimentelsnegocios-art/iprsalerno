import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Cross, Lock, Mail, Phone, User, Users } from "lucide-react";
import { useState } from "react";

import dove from "@/assets/dove.png";
import { supabase } from "@/integrations/supabase/client";
import { OPCOES_MINISTERIOS } from "@/lib/ministerios-opcoes";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastre-se — Família IPRB Renovada" },
      { name: "description", content: "Crie sua conta na Igreja Presbiteriana Renovada." },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ministeriosEscolhidos, setMinisteriosEscolhidos] = useState<string[]>([]);
  const [concordo, setConcordo] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const [enviando, setEnviando] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim() || !email.trim() || !senha) {
      setErro("Preencha nome, e-mail e senha para continuar.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem. Confira e tente de novo.");
      return;
    }
    if (!concordo) {
      setErro("É preciso concordar em fazer parte para criar a conta.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nome: nome.trim(),
          whatsapp: whatsapp || null,
          ministerios: ministeriosEscolhidos,
        },
      },
    });
    setEnviando(false);
    if (error) {
      setErro(
        error.message.toLowerCase().includes("already")
          ? "Esse e-mail já tem conta. Tente entrar ou recuperar a senha."
          : "Não conseguimos criar sua conta agora. Tente novamente em instantes.",
      );
      return;
    }
    setSucesso(true);
  }

  const inputCls =
    "w-full bg-transparent text-sm text-[#1E3A5F] outline-none placeholder:text-[#1E3A5F]/40";
  const fieldCls =
    "flex items-center gap-3 rounded-2xl border border-[#1E3A5F]/10 bg-[#F8F5F0] px-4 py-3";

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-b from-[#F8F5F0] to-[#E8E0D5] px-4 py-10">
      <img
        src={dove}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-4 top-8 w-40 opacity-10 md:left-24 md:w-64"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-black/5 md:p-9">
        {sucesso ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A5F]">
              <Cross className="h-7 w-7 text-[#D4B678]" />
            </div>
            <h1 className="mt-4 font-serif text-2xl font-semibold text-[#1E3A5F]">
              Cadastro recebido!
            </h1>
            <p className="mt-2 text-sm text-[#1E3A5F]/60">
              Sua conta foi criada e seu nome foi enviado para a liderança. Já pode entrar e
              começar a fazer parte de tudo por aqui.
            </p>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-6 w-full rounded-2xl bg-[#1E3A5F] py-3.5 text-sm font-semibold text-white"
            >
              Voltar para o login
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A5F]">
                <Cross className="h-7 w-7 text-[#D4B678]" />
              </div>
              <h1 className="mt-4 font-serif text-2xl font-semibold text-[#1E3A5F]">
                Bem-vindo à Família IPRB Renovada
              </h1>
              <p className="mt-1 text-sm text-[#1E3A5F]/60">Que bom ter você aqui</p>
            </div>

            <form onSubmit={cadastrar} className="mt-7 space-y-3.5">
              <label className={fieldCls}>
                <User className="h-4 w-4 shrink-0 text-[#B89B5E]" />
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  className={inputCls}
                />
              </label>
              <label className={fieldCls}>
                <Mail className="h-4 w-4 shrink-0 text-[#B89B5E]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className={inputCls}
                />
              </label>
              <label className={fieldCls}>
                <Lock className="h-4 w-4 shrink-0 text-[#B89B5E]" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha"
                  className={inputCls}
                />
              </label>
              <label className={fieldCls}>
                <Lock className="h-4 w-4 shrink-0 text-[#B89B5E]" />
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Confirmar senha"
                  className={inputCls}
                />
              </label>
              <label className={fieldCls}>
                <Phone className="h-4 w-4 shrink-0 text-[#B89B5E]" />
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp (opcional)"
                  className={inputCls}
                />
              </label>
              <div className="rounded-2xl border border-[#1E3A5F]/10 bg-[#F8F5F0] px-4 py-3">
                <p className="flex items-center gap-2 text-xs font-medium text-[#1E3A5F]/70">
                  <Users className="h-4 w-4 shrink-0 text-[#B89B5E]" />
                  Quais ministérios você frequenta? (pode marcar vários)
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {OPCOES_MINISTERIOS.map((m) => {
                    const marcado = ministeriosEscolhidos.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() =>
                          setMinisteriosEscolhidos((atual) =>
                            marcado ? atual.filter((x) => x !== m) : [...atual, m],
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          marcado
                            ? "bg-[#1E3A5F] text-white"
                            : "border border-[#1E3A5F]/15 text-[#1E3A5F]/70"
                        }`}
                      >
                        {marcado ? "✓ " : ""}
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-start gap-3 px-1 pt-1">
                <input
                  type="checkbox"
                  checked={concordo}
                  onChange={(e) => setConcordo(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#1E3A5F]"
                />
                <span className="text-xs text-[#1E3A5F]/70">
                  Concordo em fazer parte da família e participar da vida da igreja.
                </span>
              </label>

              {erro && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-700">{erro}</p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-2xl bg-[#1E3A5F] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1E3A5F]/90"
              >
                {enviando ? "Criando..." : "Criar minha conta"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-[#1E3A5F]/60">
              Já tem conta?{" "}
              <Link to="/login" className="font-semibold text-[#1E3A5F] hover:underline">
                Entrar
              </Link>
            </p>

            <p className="mt-6 border-t border-[#1E3A5F]/10 pt-4 text-center text-[11px] italic text-[#1E3A5F]/50">
              "Assim como nos acolhestes, acolhei-vos uns aos outros" — Romanos 15:7
            </p>
          </>
        )}
      </div>
    </div>
  );
}
