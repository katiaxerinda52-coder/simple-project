import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Configuração do servidor incompleta." }, 500);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Sessão inválida. Entre novamente." }, 401);

  let email = "";
  let redirectTo = "";
  try {
    const body = await req.json();
    email = String(body.email ?? "").trim().toLowerCase();
    redirectTo = String(body.redirectTo ?? "");
  } catch {
    return json({ error: "Pedido inválido." }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Introduza um e-mail válido." }, 400);

  const origin = req.headers.get("Origin");
  if (!origin || !redirectTo.startsWith(origin + "/")) {
    return json({ error: "Endereço de retorno inválido." }, 400);
  }

  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await caller.auth.getUser();
  if (userError || !userData.user) return json({ error: "Sessão inválida. Entre novamente." }, 401);

  const { data: admin, error: adminError } = await caller.rpc("is_admin");
  if (adminError || admin !== true) return json({ error: "Apenas a administradora pode enviar convites." }, 403);

  const { error: allowError } = await caller.rpc("admin_add_authorized_user", { p_email: email });
  if (allowError) return json({ error: allowError.message || "Não foi possível autorizar este e-mail." }, 400);

  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: inviteError } = await service.auth.admin.inviteUserByEmail(email, { redirectTo });

  if (inviteError) {
    // The address remains authorized. Existing accounts can use "Recuperar palavra-passe".
    const alreadyExists = /already|registered|exists|user/i.test(inviteError.message);
    if (alreadyExists) {
      return json({
        ok: true,
        invited: false,
        message: "E-mail autorizado. Esta pessoa já tem conta; deve usar «Esqueci-me da palavra-passe» para definir uma palavra-passe.",
      });
    }
    await caller.rpc("admin_remove_authorized_user", { p_email: email });
    return json({ error: "Não foi possível enviar o convite. Confirme a configuração de e-mail do Supabase." }, 502);
  }

  return json({ ok: true, invited: true, message: "Convite enviado. A pessoa deve abrir o e-mail e definir a palavra-passe." });
});
