import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Json } from "../integrations/supabase/types";
import { supabase } from "../integrations/supabase/client";

type RecipeId = "alcohol" | "without-alcohol" | "black-beer";
type AuthorizedUser = { email: string; role: "admin" | "user"; active: boolean; created_at: string };

export function AccessGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [configurationError, setConfigurationError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [recipeId, setRecipeId] = useState<RecipeId>("alcohol");
  const [recipeJson, setRecipeJson] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};
    try {
      const auth = supabase.auth;
      auth.getSession().then(({ data, error }) => {
        if (!mounted) return;
        if (error) setConfigurationError(true);
        setSession(data.session);
        setInitializing(false);
      }).catch(() => {
        if (mounted) {
          setConfigurationError(true);
          setInitializing(false);
        }
      });
      const { data: { subscription } } = auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setInitializing(false);
      });
      unsubscribe = () => subscription.unsubscribe();
    } catch {
      setConfigurationError(true);
      setInitializing(false);
    }
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!session) {
      setAuthorized(false);
      setAdmin(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    Promise.all([
      supabase.rpc("is_app_authorized"),
      supabase.rpc("is_app_admin"),
    ]).then(([accessResult, adminResult]) => {
      if (!active) return;
      setAuthorized(accessResult.data === true && !accessResult.error);
      setAdmin(adminResult.data === true && !adminResult.error);
      setChecking(false);
    }).catch(() => {
      if (active) {
        setAuthorized(false);
        setAdmin(false);
        setChecking(false);
      }
    });
    return () => { active = false; };
  }, [session]);

  const loadUsers = async () => {
    const { data, error } = await supabase.from("authorized_users").select("email,role,active,created_at").order("email");
    if (error) {
      setAdminMessage("Não foi possível carregar a lista de acessos.");
      return;
    }
    setUsers(data ?? []);
  };

  const loadRecipe = async (id: RecipeId) => {
    setRecipeId(id);
    const { data, error } = await supabase.from("wedding_cake_recipes").select("recipe").eq("id", id).maybeSingle();
    if (error || !data) {
      setAdminMessage("Não foi possível carregar esta receita.");
      return;
    }
    setRecipeJson(JSON.stringify(data.recipe, null, 2));
  };

  useEffect(() => {
    if (admin && panelOpen) {
      void loadUsers();
      void loadRecipe(recipeId);
    }
  }, [admin, panelOpen]);

  const sendMagicLink = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage("Introduza um endereço de e-mail válido.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    setMessage(error
      ? "Não foi possível enviar o link. Confirme a configuração do e-mail e tente novamente."
      : "Se este e-mail estiver autorizado, receberá um link de acesso. Verifique também o spam.");
  };

  const addUser = async () => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setAdminMessage("Introduza um e-mail válido.");
      return;
    }
    const { error } = await supabase.from("authorized_users").insert({ email: cleanEmail, role: "user", active: true });
    if (error) {
      setAdminMessage(error.code === "23505" ? "Este e-mail já está registado." : "Não foi possível adicionar este e-mail.");
      return;
    }
    setNewEmail("");
    setAdminMessage("E-mail autorizado com sucesso.");
    await loadUsers();
  };

  const removeUser = async (userEmail: string) => {
    const { error } = await supabase.from("authorized_users").delete().eq("email", userEmail).eq("role", "user");
    setAdminMessage(error ? "Não foi possível revogar este acesso." : "Acesso revogado.");
    if (!error) await loadUsers();
  };

  const saveRecipe = async () => {
    let parsed: Json;
    try {
      parsed = JSON.parse(recipeJson) as Json;
    } catch {
      setAdminMessage("O conteúdo da receita não é um JSON válido. Corrija antes de guardar.");
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || (parsed as { id?: unknown }).id !== recipeId) {
      setAdminMessage("A receita deve ser um objecto JSON e manter o identificador seleccionado.");
      return;
    }
    const { error } = await supabase.from("wedding_cake_recipes").update({ recipe: parsed }).eq("id", recipeId);
    setAdminMessage(error ? "Não foi possível guardar a receita." : "Receita actualizada com sucesso.");
  };

  if (configurationError) {
    return <div style={screenStyle}><div style={panelStyle}><strong>Configuração de acesso incompleta</strong><p style={mutedStyle}>O Supabase ainda não está configurado nesta publicação. Verifique as variáveis de ligação e a configuração do projecto.</p></div></div>;
  }

  if (initializing || checking) {
    return <div style={screenStyle}><div style={panelStyle}><strong>Massas de Noiva Pro</strong><p>A verificar o acesso seguro…</p></div></div>;
  }

  if (!session) {
    return (
      <div style={screenStyle}>
        <form style={panelStyle} onSubmit={(event) => { event.preventDefault(); void sendMagicLink(); }}>
          <span style={eyebrowStyle}>ACESSO PRIVADO</span>
          <h1 style={{ margin: "10px 0", fontSize: 26 }}>Massas de Noiva Pro</h1>
          <p style={mutedStyle}>Introduza o e-mail que foi autorizado pela administradora. Enviaremos um link seguro para entrar, sem palavra-passe.</p>
          <label style={labelStyle} htmlFor="access-email">E-mail autorizado</label>
          <input id="access-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@exemplo.com" style={inputStyle} />
          <button disabled={busy} type="submit" style={buttonStyle}>{busy ? "A enviar…" : "Enviar link de acesso"}</button>
          {message && <p role="status" style={mutedStyle}>{message}</p>}
          <small style={mutedStyle}>Partilhar o endereço desta página não concede acesso às receitas nem à calculadora.</small>
        </form>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={screenStyle}>
        <div style={panelStyle}>
          <span style={eyebrowStyle}>ACESSO NÃO AUTORIZADO</span>
          <h1 style={{ fontSize: 25 }}>Este e-mail ainda não tem permissão.</h1>
          <p style={mutedStyle}>A sessão foi iniciada como {session.user.email ?? "utilizador"}. Peça à administradora para adicionar este endereço à lista de acesso.</p>
          <button style={buttonStyle} onClick={() => void supabase.auth.signOut()}>Terminar sessão</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50, display: "flex", gap: 8 }}>
        {admin && <button style={smallButtonStyle} onClick={() => setPanelOpen((open) => !open)}>{panelOpen ? "Fechar gestão" : "Gestão da aplicação"}</button>}
        <button style={smallButtonStyle} onClick={() => void supabase.auth.signOut()}>Sair</button>
      </div>
      {admin && panelOpen && (
        <div style={overlayStyle}>
          <section style={adminPanelStyle} aria-label="Painel de administração">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div><span style={eyebrowStyle}>ADMINISTRADORA</span><h2 style={{ margin: "6px 0 16px" }}>Gestão da aplicação</h2></div>
              <button style={smallButtonStyle} onClick={() => setPanelOpen(false)}>Fechar</button>
            </div>
            <h3>Utilizadoras autorizadas</h3>
            <p style={mutedStyle}>Adicione apenas os e-mails que devem entrar. Remover um e-mail revoga o acesso nas próximas verificações.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="email@exemplo.com" style={{ ...inputStyle, margin: 0 }} />
              <button style={buttonStyle} onClick={() => void addUser()}>Adicionar</button>
            </div>
            <div style={{ maxHeight: 160, overflowY: "auto", margin: "12px 0 20px" }}>
              {users.map((user) => <div key={user.email} style={userRowStyle}><span>{user.email}{user.role === "admin" ? " · Administradora" : ""}</span>{user.role !== "admin" && <button style={removeButtonStyle} onClick={() => void removeUser(user.email)}>Revogar</button>}</div>)}
            </div>
            <hr style={{ borderColor: "#e8e0d8", margin: "16px 0" }} />
            <h3>Receitas originais</h3>
            <p style={mutedStyle}>Apenas a administradora pode alterar ingredientes, quantidades, preparação e notas. Guarde o conteúdo completo da receita.</p>
            <select value={recipeId} onChange={(event) => void loadRecipe(event.target.value as RecipeId)} style={inputStyle}>
              <option value="alcohol">Massa de noiva com álcool</option>
              <option value="without-alcohol">Massa de noiva sem álcool</option>
              <option value="black-beer">Massa de noiva com cerveja preta</option>
            </select>
            <textarea value={recipeJson} onChange={(event) => setRecipeJson(event.target.value)} rows={12} spellCheck={false} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }} />
            <button style={buttonStyle} onClick={() => void saveRecipe()}>Guardar receita original</button>
            {adminMessage && <p role="status" style={mutedStyle}>{adminMessage}</p>}
          </section>
        </div>
      )}
    </>
  );
}

const screenStyle: CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f4f0e9", color: "#29251f", fontFamily: "Arial, sans-serif" };
const panelStyle: CSSProperties = { width: "min(100%, 440px)", padding: 32, borderRadius: 18, background: "#fffdf9", boxShadow: "0 18px 60px rgba(40,30,20,.12)" };
const adminPanelStyle: CSSProperties = { width: "min(100%, 760px)", maxHeight: "90vh", overflowY: "auto", padding: 24, borderRadius: 18, background: "#fffdf9", color: "#29251f", boxShadow: "0 18px 60px rgba(40,30,20,.2)" };
const overlayStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: 60, background: "rgba(20,18,16,.65)", display: "grid", placeItems: "center", padding: 16 };
const eyebrowStyle: CSSProperties = { color: "#8a6749", fontSize: 11, letterSpacing: 2, fontWeight: 700 };
const mutedStyle: CSSProperties = { color: "#756e65", lineHeight: 1.55, fontSize: 14 };
const labelStyle: CSSProperties = { display: "block", margin: "20px 0 8px", fontSize: 13, fontWeight: 700 };
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid #d9d0c5", borderRadius: 9, background: "#fff", color: "#29251f", margin: "8px 0 12px" };
const buttonStyle: CSSProperties = { border: 0, borderRadius: 9, padding: "12px 16px", background: "#335b49", color: "#fff", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
const smallButtonStyle: CSSProperties = { border: "1px solid #c8bba9", borderRadius: 8, padding: "9px 12px", background: "#fffdf9", color: "#29251f", fontWeight: 700, cursor: "pointer" };
const userRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderBottom: "1px solid #eee7df", padding: "9px 0", fontSize: 13 };
const removeButtonStyle: CSSProperties = { border: "1px solid #d7b9b4", borderRadius: 7, padding: "6px 9px", background: "#fff7f5", color: "#8b3931", cursor: "pointer" };
