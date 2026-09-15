import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string };
  client_name?: string;
  redirect_uri?: string;
  scopes?: string[] | string;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthResult = { data: AuthorizationDetails | null; error: { message?: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Autorizar Livro Caixa — Família IPRB Renovada" },
      { name: "description", content: "Autorize o acesso seguro ao Livro Caixa da igreja." },
      { property: "og:title", content: "Autorizar Livro Caixa — Família IPRB Renovada" },
      { property: "og:description", content: "Confirmação segura de acesso ao Livro Caixa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <ConsentError message="Não foi possível abrir esta autorização." />,
  component: ConsentPage,
});

function oauthApi(): OAuthApi | null {
  const auth = supabase.auth as typeof supabase.auth & { oauth?: OAuthApi };
  return auth.oauth ?? null;
}

function redirectFrom(data: AuthorizationDetails | null) {
  return data?.redirect_url ?? data?.redirect_to ?? null;
}

function ConsentPage() {
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"approve" | "deny" | null>(null);

  const authorizationId =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("authorization_id");

  useEffect(() => {
    async function load() {
      if (!authorizationId) {
        setError("Esta solicitação de acesso é inválida ou expirou.");
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setEmail(userData.user.email ?? "Conta da igreja");

      const oauth = oauthApi();
      if (!oauth) {
        setError("O acesso seguro está temporariamente indisponível.");
        setLoading(false);
        return;
      }
      const result = await oauth.getAuthorizationDetails(authorizationId);
      if (result.error) {
        setError("Esta solicitação de acesso é inválida ou expirou.");
        setLoading(false);
        return;
      }
      const immediateRedirect = redirectFrom(result.data);
      if (immediateRedirect && !result.data?.client && !result.data?.client_name) {
        window.location.assign(immediateRedirect);
        return;
      }
      setDetails(result.data);
      setLoading(false);
    }
    void load();
  }, [authorizationId]);

  async function decide(kind: "approve" | "deny") {
    if (!authorizationId) return;
    const oauth = oauthApi();
    if (!oauth) return;
    setAction(kind);
    const result =
      kind === "approve"
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
    const destination = redirectFrom(result.data);
    if (result.error || !destination) {
      setError(
        kind === "approve"
          ? "Não foi possível autorizar agora. Tente novamente."
          : "Não foi possível cancelar agora. Tente novamente.",
      );
      setAction(null);
      return;
    }
    window.location.assign(destination);
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-7 animate-spin text-primary" aria-label="Carregando autorização" />
      </main>
    );
  }
  if (error || !details) return <ConsentError message={error || "Autorização não encontrada."} />;

  const clientName = details.client?.name ?? details.client_name ?? "Livro Caixa IPRB";
  const scopeText = Array.isArray(details.scopes)
    ? details.scopes.join(" ")
    : details.scopes ?? details.scope ?? "openid email profile";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <section className="surface-card w-full max-w-md p-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Conectar {clientName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O Livro Caixa poderá confirmar sua identidade e respeitará suas permissões atuais.
        </p>
        <div className="mt-5 space-y-2 rounded-md border border-border bg-muted/40 p-4 text-left text-sm">
          <p><strong>Conta:</strong> {email}</p>
          <p><strong>Compartilhar:</strong> perfil básico e e-mail</p>
          <p className="break-words text-xs text-muted-foreground">Permissões solicitadas: {scopeText}</p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Esta conexão não ignora cargos, permissões ou regras de acesso da igreja.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" disabled={action !== null} onClick={() => void decide("deny")}>
            Cancelar
          </Button>
          <Button disabled={action !== null} onClick={() => void decide("approve")}>
            {action === "approve" ? <Loader2 className="animate-spin" /> : null}
            Autorizar
          </Button>
        </div>
      </section>
    </main>
  );
}

function ConsentError({ message }: { message: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <section className="surface-card w-full max-w-md p-6 text-center">
        <ShieldCheck className="mx-auto size-8 text-primary" />
        <h1 className="mt-3 text-lg font-bold">Acesso não concluído</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button className="mt-5" onClick={() => window.location.assign("/")}>Voltar ao aplicativo</Button>
      </section>
    </main>
  );
}