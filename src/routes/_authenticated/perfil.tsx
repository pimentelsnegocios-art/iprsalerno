import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CalendarHeart,
  Check,
  Droplets,
  HandHeart,
  KeyRound,
  Loader2,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { cultos, pedidosOracao } from "@/lib/church-data";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — IPR Renovada" },
      {
        name: "description",
        content:
          "Seus dados de reino, família na igreja, próximos passos, mural e engajamento na Igreja Presbiteriana Renovada.",
      },
      { property: "og:title", content: "Meu Perfil — IPR Renovada" },
      { property: "og:description", content: "Sua caminhada e sua família na igreja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perfil,
});

const MINISTERIOS = [
  "Louvor",
  "Jovens",
  "Homens",
  "Mulheres",
  "Infantil",
  "Recepção",
] as const;
const STATUS = ["Membro", "Visitante", "Liderança"] as const;
const PASSOS = ["Batismo", "Curso de Membros", "Voluntariado"] as const;

interface Profile {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  endereco: string | null;
  nascimento: string | null;
  batismo: string | null;
  ministerio: string | null;
  status: string;
  cargo: string;
  funcao: string | null;
  versiculo: string | null;
  bio: string | null;
  foto_url: string | null;
  membro_desde: string;
}

interface Familiar {
  id: string;
  nome: string;
  parentesco: string;
}
interface Passo {
  id: string;
  passo: string;
  concluido: boolean;
}
interface Recado {
  id: string;
  autor_nome: string;
  texto: string;
  created_at: string;
}

function mascaraWhatsapp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const dataBR = (iso: string | null) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR") : "—";

function Perfil() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [familia, setFamilia] = useState<Familiar[]>([]);
  const [passos, setPassos] = useState<Passo[]>([]);
  const [mural, setMural] = useState<Recado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [modalFamiliar, setModalFamiliar] = useState(false);
  const [novoRecado, setNovoRecado] = useState("");
  const [confirmados, setConfirmados] = useState<string[]>([]);

  const carregar = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;

    const [p, f, pa, m] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("familiares").select("id, nome, parentesco").eq("profile_id", uid),
      supabase.from("proximos_passos").select("id, passo, concluido").eq("profile_id", uid),
      supabase
        .from("mural")
        .select("id, autor_nome, texto, created_at")
        .eq("profile_id", uid)
        .order("created_at", { ascending: false }),
    ]);

    const prof = (p.data as Profile | null) ?? null;
    setPerfil(prof);
    setFamilia((f.data as Familiar[]) ?? []);
    setPassos((pa.data as Passo[]) ?? []);
    setMural((m.data as Recado[]) ?? []);

    if (prof?.foto_url) {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(prof.foto_url, 3600);
      setFotoUrl(signed?.signedUrl ?? null);
    } else {
      setFotoUrl(null);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("ipr-eventos-confirmados");
      if (raw) setConfirmados(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  function alternarEvento(slug: string) {
    setConfirmados((atual) => {
      const novo = atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug];
      try {
        window.localStorage.setItem("ipr-eventos-confirmados", JSON.stringify(novo));
      } catch {
        /* ignore */
      }
      return novo;
    });
  }

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  async function enviarFoto(file: File) {
    if (!perfil) return;
    const ext = file.name.split(".").pop() ?? "jpg";
    const caminho = `${perfil.id}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(caminho, file, { upsert: true });
    if (error) {
      toast.error("Não conseguimos enviar sua foto agora. Tente novamente.");
      return;
    }
    await supabase.from("profiles").update({ foto_url: caminho }).eq("id", perfil.id);
    toast.success("Foto atualizada!");
    void carregar();
  }

  async function alternarPasso(nome: string) {
    if (!perfil) return;
    const atual = passos.find((p) => p.passo === nome);
    if (atual) {
      await supabase
        .from("proximos_passos")
        .update({ concluido: !atual.concluido })
        .eq("id", atual.id);
    } else {
      await supabase
        .from("proximos_passos")
        .insert({ profile_id: perfil.id, passo: nome, concluido: true });
    }
    void carregar();
  }

  async function publicarRecado(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil || !novoRecado.trim()) return;
    const { error } = await supabase.from("mural").insert({
      profile_id: perfil.id,
      autor_id: perfil.id,
      autor_nome: perfil.nome,
      texto: novoRecado.trim(),
    });
    if (error) {
      toast.error("Não foi possível publicar agora.");
      return;
    }
    setNovoRecado("");
    void carregar();
  }

  async function excluirRecado(id: string) {
    await supabase.from("mural").delete().eq("id", id);
    void carregar();
  }

  async function excluirFamiliar(id: string) {
    await supabase.from("familiares").delete().eq("id", id);
    void carregar();
  }

  if (carregando) {
    return (
      <AppShell>
        <PageHeader title="Meu Perfil" />
        <div className="flex items-center justify-center py-20 text-soft">
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!perfil) {
    return (
      <AppShell>
        <PageHeader title="Meu Perfil" />
        <p className="px-5 py-10 text-sm text-soft">Não encontramos seu perfil.</p>
      </AppShell>
    );
  }

  const iniciais = (perfil.nome || perfil.email)
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ehLideranca = perfil.status === "Liderança" || perfil.cargo !== "Membro";
  const meusPedidos = pedidosOracao.filter((p) => p.autor === perfil.nome);

  return (
    <AppShell>
      <PageHeader title="Meu Perfil" />
      <div className="space-y-4 px-5 py-5">
        {/* Cabeçalho */}
        <div className="surface-card flex items-center gap-4 p-4">
          <div className="relative">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {fotoUrl ? (
                <img src={fotoUrl} alt={perfil.nome} className="size-16 object-cover" />
              ) : (
                iniciais
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-primary">
              <Camera className="size-3.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void enviarFoto(f);
                }}
              />
            </label>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl">{perfil.nome}</h2>
              {ehLideranca && (
                <span className="rounded-full border border-primary/60 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Líder
                </span>
              )}
            </div>
            <p className="text-xs text-soft">
              {perfil.cargo}
              {perfil.ministerio ? ` · Ministério de ${perfil.ministerio}` : ""}
            </p>
            <p className="text-xs text-primary">{perfil.status}</p>
          </div>
        </div>

        {/* Dados de Reino */}
        <div className="surface-card p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
            Dados de Reino
          </h3>
          <div className="mt-2 divide-y divide-border">
            {[
              ["Ministério", perfil.ministerio ?? "—"],
              ["Data de batismo", dataBR(perfil.batismo)],
              ["Aniversário", dataBR(perfil.nascimento)],
              ["Membro desde", dataBR(perfil.membro_desde)],
              ["WhatsApp", perfil.whatsapp || "—"],
              ["Endereço", perfil.endereco || "—"],
              ["E-mail", perfil.email],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                <span className="text-soft">{k}</span>
                <span className="text-right font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="surface-card p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-primary">Bio</h3>
          <p className="mt-1 text-sm">{perfil.bio || "Conte um pouco da sua história aqui."}</p>
          <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-primary">
            Versículo favorito
          </h3>
          <p className="mt-1 text-sm italic">{perfil.versiculo || "—"}</p>
        </div>

        {/* Família */}
        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg">
              <Users className="size-4 text-primary" /> Minha Família na Igreja
            </h3>
            <button
              onClick={() => setModalFamiliar(true)}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <Plus className="size-3.5" /> Adicionar
            </button>
          </div>
          {familia.length === 0 ? (
            <p className="mt-2 text-sm text-soft">
              Nenhum familiar cadastrado ainda. Ligue sua esposa, filhos ou pais que também
              congregam aqui.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {familia.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{f.nome}</p>
                    <p className="text-xs text-soft">{f.parentesco}</p>
                  </div>
                  <button onClick={() => void excluirFamiliar(f.id)} className="text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Próximos passos */}
        <div className="surface-card p-4">
          <h3 className="flex items-center gap-2 font-display text-lg">
            <Droplets className="size-4 text-primary" /> Meus Próximos Passos
          </h3>
          <ul className="mt-3 space-y-2">
            {PASSOS.map((nome) => {
              const feito =
                passos.find((p) => p.passo === nome)?.concluido ||
                (nome === "Batismo" && !!perfil.batismo);
              return (
                <li key={nome}>
                  <button
                    onClick={() => void alternarPasso(nome)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left text-sm"
                  >
                    <span
                      className={`flex size-6 items-center justify-center rounded-full border ${
                        feito
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-transparent"
                      }`}
                    >
                      <Check className="size-3.5" />
                    </span>
                    <span className={feito ? "font-medium" : "text-soft"}>{nome}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Engajamento */}
        <div className="surface-card p-4">
          <h3 className="flex items-center gap-2 font-display text-lg">
            <HandHeart className="size-4 text-primary" /> Meu Engajamento
          </h3>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">
            Pedidos de oração que fiz
          </p>
          {meusPedidos.length === 0 ? (
            <p className="mt-1 text-sm text-soft">Você ainda não fez pedidos de oração.</p>
          ) : (
            <ul className="mt-1 space-y-2">
              {meusPedidos.map((p) => (
                <li key={p.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                  <p>{p.texto}</p>
                  <p className="mt-1 text-xs text-soft">
                    {p.categoria} · {p.orando} orando
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-primary">
            Eventos que confirmei
          </p>
          <ul className="mt-1 space-y-2">
            {cultos.map((c) => {
              const ok = confirmados.includes(c.slug);
              return (
                <li key={c.slug}>
                  <button
                    onClick={() => alternarEvento(c.slug)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-left text-sm"
                  >
                    <span>
                      <span className="font-medium">{c.dia}</span>
                      <span className="block text-xs text-soft">
                        {c.tema} · {c.horario}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                        ok ? "bg-primary text-primary-foreground" : "border border-border text-soft"
                      }`}
                    >
                      {ok ? "Confirmado" : "Confirmar"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mural (único) */}
        <div className="surface-card p-4">
          <h3 className="flex items-center gap-2 font-display text-lg">
            <CalendarHeart className="size-4 text-primary" /> Mural
          </h3>
          <form onSubmit={publicarRecado} className="mt-3 flex gap-2">
            <input
              value={novoRecado}
              onChange={(e) => setNovoRecado(e.target.value)}
              placeholder="Deixe um versículo ou recado"
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button className="rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground">
              Enviar
            </button>
          </form>
          {mural.length === 0 ? (
            <p className="mt-3 text-sm text-soft">Nenhum recado no seu mural ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {mural.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm">{r.texto}</p>
                    <p className="mt-0.5 text-xs text-soft">
                      {r.autor_nome} · {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <button onClick={() => void excluirRecado(r.id)} className="text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Caixa de mensagens */}
        <div className="surface-card p-4">
          <h3 className="flex items-center gap-2 font-display text-lg">
            <MessageSquare className="size-4 text-primary" /> Caixa de mensagens
          </h3>
          <p className="mt-1 text-sm text-soft">Você não tem mensagens novas.</p>
        </div>

        <div className="grid gap-2">
          <button
            onClick={() => setModalEditar(true)}
            className="surface-card flex items-center gap-3 px-4 py-3 text-sm font-medium"
          >
            <Pencil className="size-4 text-primary" /> Editar dados e foto
          </button>
          <button
            onClick={() => setModalSenha(true)}
            className="surface-card flex items-center gap-3 px-4 py-3 text-sm font-medium"
          >
            <KeyRound className="size-4 text-primary" /> Trocar senha
          </button>
          <button
            onClick={() => void sair()}
            className="surface-card flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </div>

      {modalEditar && (
        <ModalEditar
          perfil={perfil}
          onClose={() => setModalEditar(false)}
          onSaved={() => {
            setModalEditar(false);
            void carregar();
          }}
        />
      )}
      {modalSenha && <ModalSenha onClose={() => setModalSenha(false)} />}
      {modalFamiliar && (
        <ModalFamiliar
          profileId={perfil.id}
          onClose={() => setModalFamiliar(false)}
          onSaved={() => {
            setModalFamiliar(false);
            void carregar();
          }}
        />
      )}
    </AppShell>
  );
}

function Modal({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-6 md:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-5 text-card-foreground shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">{titulo}</h2>
          <button onClick={onClose} className="text-soft">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const campoCls =
  "w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm outline-none";

function ModalEditar({
  perfil,
  onClose,
  onSaved,
}: {
  perfil: Profile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nome: perfil.nome,
    whatsapp: perfil.whatsapp ?? "",
    endereco: perfil.endereco ?? "",
    nascimento: perfil.nascimento ?? "",
    batismo: perfil.batismo ?? "",
    ministerio: perfil.ministerio ?? "",
    status: perfil.status,
    versiculo: perfil.versiculo ?? "",
    bio: perfil.bio ?? "",
  });
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nome: form.nome.trim(),
        whatsapp: form.whatsapp || null,
        endereco: form.endereco || null,
        nascimento: form.nascimento || null,
        batismo: form.batismo || null,
        ministerio: form.ministerio || null,
        status: form.status,
        versiculo: form.versiculo || null,
        bio: form.bio || null,
      })
      .eq("id", perfil.id);
    setSalvando(false);
    if (error) {
      toast.error("Não conseguimos salvar seus dados agora.");
      return;
    }
    toast.success("Perfil atualizado!");
    onSaved();
  }

  return (
    <Modal titulo="Editar meus dados" onClose={onClose}>
      <form onSubmit={salvar} className="mt-4 space-y-3">
        <input
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          placeholder="Nome completo"
          className={campoCls}
        />
        <input value={perfil.email} readOnly className={`${campoCls} text-soft`} />
        <p className="-mt-2 px-1 text-[11px] text-soft">
          O e-mail é usado apenas para recuperar sua senha.
        </p>
        <input
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: mascaraWhatsapp(e.target.value) })}
          placeholder="WhatsApp (11) 99999-0000"
          className={campoCls}
        />
        <input
          value={form.endereco}
          onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          placeholder="Endereço"
          autoComplete="street-address"
          className={campoCls}
        />
        <label className="block text-xs text-soft">
          Data de nascimento
          <input
            type="date"
            value={form.nascimento}
            onChange={(e) => setForm({ ...form, nascimento: e.target.value })}
            className={`${campoCls} mt-1`}
          />
        </label>
        <label className="block text-xs text-soft">
          Data de batismo
          <input
            type="date"
            value={form.batismo}
            onChange={(e) => setForm({ ...form, batismo: e.target.value })}
            className={`${campoCls} mt-1`}
          />
        </label>
        <select
          value={form.ministerio}
          onChange={(e) => setForm({ ...form, ministerio: e.target.value })}
          className={campoCls}
        >
          <option value="">Ministério que frequenta</option>
          {MINISTERIOS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className={campoCls}
        >
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={form.versiculo}
          onChange={(e) => setForm({ ...form, versiculo: e.target.value })}
          placeholder="Versículo favorito"
          className={campoCls}
        />
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Bio"
          rows={3}
          className={campoCls}
        />
        <button
          disabled={salvando}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </Modal>
  );
}

function ModalSenha({ onClose }: { onClose: () => void }) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (nova.length < 6) {
      toast.error("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: nova,
      current_password: atual,
    } as Parameters<typeof supabase.auth.updateUser>[0]);
    if (error) {
      toast.error("Não conseguimos trocar a senha. Confira a senha atual.");
      return;
    }
    toast.success("Senha atualizada!");
    onClose();
  }

  return (
    <Modal titulo="Trocar senha" onClose={onClose}>
      <form onSubmit={salvar} className="mt-4 space-y-3">
        <input
          type="password"
          value={atual}
          onChange={(e) => setAtual(e.target.value)}
          placeholder="Senha atual"
          className={campoCls}
        />
        <input
          type="password"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          placeholder="Nova senha"
          className={campoCls}
        />
        <button className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
          Salvar nova senha
        </button>
      </form>
    </Modal>
  );
}

function ModalFamiliar({
  profileId,
  onClose,
  onSaved,
}: {
  profileId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState("");
  const [parentesco, setParentesco] = useState("Esposa(o)");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    const { error } = await supabase
      .from("familiares")
      .insert({ profile_id: profileId, nome: nome.trim(), parentesco });
    if (error) {
      toast.error("Não conseguimos adicionar agora.");
      return;
    }
    onSaved();
  }

  return (
    <Modal titulo="Adicionar familiar" onClose={onClose}>
      <form onSubmit={salvar} className="mt-4 space-y-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do familiar"
          className={campoCls}
        />
        <select
          value={parentesco}
          onChange={(e) => setParentesco(e.target.value)}
          className={campoCls}
        >
          {["Esposa(o)", "Filho(a)", "Pai", "Mãe", "Irmão(ã)", "Outro"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
          Adicionar
        </button>
      </form>
    </Modal>
  );
}
