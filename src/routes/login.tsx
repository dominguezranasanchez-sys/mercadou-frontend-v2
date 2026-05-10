import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FormInput } from "@/components/FormInput";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Markety" }] }),
  component: Login,
});

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("ana@mail.com");
  const [password, setPassword] = useState("demo1234");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) { setErr("Completa todos los campos"); return; }
    try { await login(email, password); navigate({ to: "/" }); }
    catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Volver</Link>
        <h1 className="text-2xl font-bold mt-2 text-foreground">Bienvenido</h1>
        <p className="text-sm text-muted-foreground mt-1">Entra a tu cuenta para continuar.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormInput label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button disabled={loading} className="w-full h-11 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-5">
          ¿Sin cuenta? <Link to="/register" className="text-primary hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
