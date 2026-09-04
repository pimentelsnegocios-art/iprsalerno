import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FUNDADOR = "louvoriprb7@gmail.com";

export const excluirUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ targetId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: ehAdmin, error: erroPapel } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (erroPapel || !ehAdmin) throw new Error("Sem permissão.");
    if (data.targetId === context.userId) throw new Error("Você não pode excluir a si mesmo.");

    const { data: alvo } = await context.supabase
      .from("profiles")
      .select("email")
      .eq("id", data.targetId)
      .maybeSingle();
    if (alvo?.email && alvo.email.toLowerCase() === FUNDADOR) {
      throw new Error("A conta do fundador não pode ser excluída.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").delete().eq("id", data.targetId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.targetId);
    if (error) throw new Error("Não foi possível excluir a conta.");
    return { ok: true };
  });
