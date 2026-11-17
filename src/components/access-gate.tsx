import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Json } from "../integrations/supabase/types";
import { appSupabase, type RecipeId } from "../integrations/supabase/app-client";

type AuthorizedUser = { email: string; active: boolean; created_at: string };
type AuthMode = "login" | "recovery" | "set-password";

export function AccessGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [configurationError, setConfigurationError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [recipeId, setRecipeId] = useState<RecipeId>("alcohol");
  const [recipeJson, setRecipeJson] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
      const auth = appSupabase.auth;
      auth.getSession().then(({ data, error }) => {
        if (!mounted) return;
        if (error) setConfigurationError(true);
        setSession(data.session);
        if (new URLSearchParams(window.location.search).has("set-password") ||
            new URLSearchParams(window.location.search).has("reset-password")) setMode("set-password");
        setInitializing(false);
      }).catch(() => {
        if (mounted) { setConfigurationError(true); setInitializing(false); }
      });
      const { data: { subscription } } = auth.onAuthStateChange((event, nextSession) => {
        setSession(nextSession);
        if (event === "PASSWORD_RECOVERY") setMode("set-password");
        setInitializing(false);
      });
      return () => { mounted = false; subscription.unsubscribe(); };
    } catch {
      setConfigurationError(true);
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let firstCheck = true;
    if (!session) {
      setAuthorized(false);
      setAdmin(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    const verifyAccess = async () => {
      try {
        const [accessResult, adminResult] = await Promise.all([
          appSupabase.rpc("is_app_authorized"),
          appSupabase.rpc("is_admin"),
        ]);
        if (!active) return;
        const canEnter = accessResult.data === true && !accessResult.error;
        setAuthorized(canEnter);
        setAdmin(adminResult.data === true && !adminResult.error);
        if (!canEnter) {
          setPanelOpen(false);
          if (!firstCheck) {
            setMessage("O seu acesso foi revogado. Termine a sessão e contacte a administradora.");
            await appSupabase.auth.signOut();
          }
        }
      } catch {
        if (active) { setAuthorized(false); setAdmin(false); }
      } finally {
        if (active && firstCheck) setChecking(false);
        firstCheck = false;
      }
    };
    void verifyAccess();
    const interval = window.setInterval(() => void verifyAccess(), 30000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void verifyAccess();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [session]);

  const loadUsers = useCallback(async (term = searchEmail) => {
    const { data, error } = await appSupabase.rpc("admin_list_authorized_users", { p_search: term.trim() || null });
    if (error) { setAdminMessage("Não foi possível carregar a lista. Confirme se continua com acesso de administradora."); return; }
    setUsers(data ?? []);
  }, [searchEmail]);

  const loadRecipe = async (id: RecipeId) => {
    setRecipeId(id);
    const { data, error } = await appSupabase.from("wedding_cake_recipes").select("recipe").eq("id", id).maybeSingle();
    if (error || !data) { setAdminMessage("Não foi possível carregar esta receita."); return; }
    setRecipeJson(JSON.stringify(data.recipe, null, 2));
  };

  useEffect(() => {
    if (admin && panelOpen) {
      void loadUsers();
      void loadRecipe(recipeId);
    }
  }, [admin, panelOpen, loadUsers]);

  const signIn = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) { setMessage("Introduza o e-mail e a palavra-passe."); return; }
    setBusy(true); setMessage("");
    const { error } = await appSupabase.auth.signInWithPassword({ email: cleanEmail, password });
    setBusy(false);
    setMessage(error ? "Não foi possível entrar. Confirme o e-mail e a palavra-passe ou recupere o acesso." : "");
  };

  const recoverPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage("Introduza primeiro um endereço de e-mail válido."); return;
    }
    setBusy(true); setMessage("");
    const { error } = await appSupabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin + "/?reset-password=1",
    });
    setBusy(false);
    setMessage(error
      ? "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde."
      : "Se existir uma conta com este endereço, receberá um e-mail para definir uma nova palavra-passe. Verifique também o spam.");
  };

  const setPassword = async () => {
    if (newPassword.length < 8) { setMessage("A palavra-passe deve ter pelo menos 8 caracteres."); return; }
    setBusy(true); setMessage("");
    const { error } = await appSupabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) { setMessage("Não foi possível guardar a palavra-passe. Abra novamente o link recebido por e-mail."); return; }
    setNewPassword("");
    setMode("login");
    window.history.replaceState({}, "", window.location.pathname);
    setMessage("Palavra-passe definida com sucesso. Já pode entrar.");
    await appSupabase.auth.signOut();
  };

  const addUser = async () => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { setAdminMessage("Introduza um e-mail válido."); return; }
    setAdminBusy(true); setAdminMessage("");
    const { data, error } = await appSupabase.functions.invoke("invite-authorized-user", {
      body: { email: cleanEmail, redirectTo: window.location.origin + "/?set-password=1" },
    });
    setAdminBusy(false);
    if (error || data?.error) { setAdminMessage(data?.error ?? "Não foi possível enviar o convite."); return; }
    setNewEmail("");
    setAdminMessage(data?.message ?? "Convite enviado.");
    await loadUsers("");
  };

  const removeUser = async (userEmail: string) => {
    setAdminBusy(true);
    const { error } = await appSupabase.rpc("admin_remove_authorized_user", { p_email: userEmail });
    setAdminBusy(false);
    setAdminMessage(error ? "Não foi possível revogar este acesso." : "Acesso revogado. A sessão será terminada na próxima verificação.");
    if (!error) await loadUsers();
  };

  const saveRecipe = async () => {
    let parsed: Json;
    try { parsed = JSON.parse(recipeJson) as Json; }
    catch { setAdminMessage("O conteúdo da receita não é um JSON válido. Corrija antes de guardar."); return; }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || (parsed as { id?: unknown }).id !== recipeId) {
      setAdminMessage("A receita deve ser um objecto JSON e manter o identificador seleccionado."); return;
    }
    const { error } = await appSupabase.from("wedding_cake_recipes").update({ recipe: parsed }).eq("id", recipeId);
    setAdminMessage(error ? "Não foi possível guardar a receita." : "Receita actualizada com sucesso.");
  };

  if (configurationError) return <div style={screenStyle}><div style={panelStyle}><strong>Configuração de acesso incompleta</strong><p style={mutedStyle}>Não foi possível ligar ao serviço de autenticação. Verifique a ligação do projecto no Lovable Cloud.</p></div></div>;
  if (initializing || checking) return <div style={screenStyle}><div style={panelStyle}><strong>Massas de Noiva Pro</strong><p>A verificar o acesso seguro…</p></div></div>;

  if (mode === "set-password") {
    return <div style={screenStyle}><form style={panelStyle} onSubmit={(e) => { e.preventDefault(); void setPassword(); }}>
      <span style={eyebrowStyle}>DEFINIR PALAVRA-PASSE</span><h1 style={{ margin: "10px 0", fontSize: 26 }}>Massas de Noiva Pro</h1>
      <p style={mutedStyle}>Escolha uma palavra-passe com pelo menos 8 caracteres.</p>
      <label style={labelStyle} htmlFor="new-password">Nova palavra-passe</label>
      <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
      <button disabled={busy} type="submit" style={{ ...buttonStyle, width: "100%" }}>{busy ? "A guardar…" : "Guardar palavra-passe"}</button>
      {message && <p role="status" style={mutedStyle}>{message}</p>}
    </form></div>;
  }

  if (!session) {
    return <div style={screenStyle}><form style={panelStyle} onSubmit={(e) => { e.preventDefault(); void (mode === "recovery" ? recoverPassword() : signIn()); }}>
      <span style={eyebrowStyle}>ACESSO PRIVADO</span><h1 style={{ margin: "10px 0", fontSize: 26 }}>Massas de Noiva Pro</h1>
      <p style={mutedStyle}>{mode === "recovery" ? "Indique o e-mail da sua conta para receber o link de recuperação." : "Entre com o e-mail e a palavra-passe definidos através do convite."}</p>
      <label style={labelStyle} htmlFor="access-email">E-mail</label>
      <input id="access-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@exemplo.com" style={inputStyle} />
      {mode === "login" && <><label style={labelStyle} htmlFor="access-password">Palavra-passe</label><input id="access-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} /></>}
      <button disabled={busy} type="submit" style={{ ...buttonStyle, width: "100%" }}>{busy ? "A processar…" : mode === "recovery" ? "Enviar recuperação" : "Entrar"}</button>
      <button disabled={busy} type="button" style={{ ...smallButtonStyle, width: "100%", marginTop: 10 }} onClick={() => { setMode(mode === "recovery" ? "login" : "recovery"); setMessage(""); }}>{mode === "recovery" ? "Voltar ao início de sessão" : "Esqueci-me da palavra-passe"}</button>
      {message && <p role="status" style={mutedStyle}>{message}</p>}
      <small style={mutedStyle}>O registo público está desactivado. Só entram endereços autorizados pela administradora.</small>
    </form></div>;
  }

  if (!authorized) return <div style={screenStyle}><div style={panelStyle}><span style={eyebrowStyle}>ACESSO NÃO AUTORIZADO</span><h1 style={{ fontSize: 25 }}>Este e-mail ainda não tem permissão.</h1><p style={mutedStyle}>A conta {session.user.email ?? "iniciada"} não está autorizada. Peça à administradora para adicionar este endereço.</p><button style={buttonStyle} onClick={() => void appSupabase.auth.signOut()}>Terminar sessão</button></div></div>;

  return <>
    {children}
    <div style={{ position: "fixed", top: 12, right: 12, left: 12, zIndex: 50, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexWrap: "wrap", pointerEvents: "none" }}>
      <span style={{ ...smallButtonStyle, maxWidth: "min(48vw, 320px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pointerEvents: "auto" }} title={session.user.email ?? "Conta activa"}>{session.user.email ?? "Conta activa"}</span>
      {admin && <button style={{ ...smallButtonStyle, pointerEvents: "auto" }} onClick={() => setPanelOpen((open) => !open)}>{panelOpen ? "Fechar gestão" : "Gestão da aplicação"}</button>}
      <button style={{ ...smallButtonStyle, pointerEvents: "auto" }} onClick={() => void appSupabase.auth.signOut()}>Sair / trocar conta</button>
    </div>
    {admin && panelOpen && <div style={overlayStyle}><section style={adminPanelStyle} aria-label="Painel de administração">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}><div><span style={eyebrowStyle}>ADMINISTRADORA</span><h2 style={{ margin: "6px 0 16px" }}>Gestão da aplicação</h2></div><button style={smallButtonStyle} onClick={() => setPanelOpen(false)}>Fechar</button></div>
      <h3>Utilizadoras autorizadas</h3><p style={mutedStyle}>Adicione um e-mail para enviar um convite de definição de palavra-passe. A revogação bloqueia as próximas operações protegidas.</p>
      <div style={{ display: "flex", gap: 8 }}><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" style={{ ...inputStyle, margin: 0 }} /><button disabled={adminBusy} style={buttonStyle} onClick={() => void addUser()}>{adminBusy ? "A enviar…" : "Convidar"}</button></div>
      <label style={labelStyle} htmlFor="search-authorized">Pesquisar e-mail</label><input id="search-authorized" type="search" value={searchEmail} onChange={(e) => { setSearchEmail(e.target.value); void loadUsers(e.target.value); }} placeholder="Pesquisar na lista…" style={inputStyle} />
      <div style={{ maxHeight: 160, overflowY: "auto", margin: "12px 0 20px" }}>{users.map((user) => <div key={user.email} style={userRowStyle}><span>{user.email}{!user.active ? " · Revogado" : ""}</span>{user.active && <button disabled={adminBusy} style={removeButtonStyle} onClick={() => void removeUser(user.email)}>Revogar</button>}</div>)}</div>
      <hr style={{ borderColor: "#e8e0d8", margin: "16px 0" }} />
      <h3>Receitas originais</h3><p style={mutedStyle}>Apenas a administradora pode alterar ingredientes, quantidades, preparação e notas.</p>
      <select value={recipeId} onChange={(e) => void loadRecipe(e.target.value as RecipeId)} style={inputStyle}><option value="alcohol">Massa de noiva com álcool</option><option value="without-alcohol">Massa de noiva sem álcool</option><option value="black-beer">Massa de noiva com cerveja preta</option></select>
      <textarea value={recipeJson} onChange={(e) => setRecipeJson(e.target.value)} rows={12} spellCheck={false} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }} />
      <button style={buttonStyle} onClick={() => void saveRecipe()}>Guardar receita original</button>
      {adminMessage && <p role="status" style={mutedStyle}>{adminMessage}</p>}
    </section></div>}
  </>;
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
