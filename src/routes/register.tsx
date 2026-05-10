import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { FormInput } from "@/components/FormInput";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Registro — Markety" }] }),
  component: Register,
});

function Register() {
  const { register, loading } = useAuth();
  const { locations, universities } = useProducts();
  const navigate = useNavigate();
  const [data, setData] = useState({ firstName: "", lastName: "", email: "", password: "", locationId: 0, universityId: 0 });
  const [err, setErr] = useState<string | null>(null);

  const visibleUnis = data.locationId
    ? universities.filter((u) => u.locationId === data.locationId)
    : universities;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.locationId) {
      setErr("Completa todos los campos."); return;
    }
    if (data.password.length < 6) { setErr("La contraseña debe tener mín. 6 caracteres."); return; }
    if (!/\S+@\S+\.\S+/.test(data.email)) { setErr("Email inválido."); return; }
    try {
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        locationId: data.locationId,
        universityId: data.universityId || undefined,
      });
      navigate({ to: "/" });
    } catch (e) { setErr((e as Error).message); }
  };

  const upd = (k: keyof typeof data, v: string | number) => setData({ ...data, [k]: v });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Volver</Link>
        <h1 className="text-2xl font-bold mt-2 text-foreground">Crea tu cuenta</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Nombre" value={data.firstName} onChange={(e) => upd("firstName", e.target.value)} required />
            <FormInput label="Apellido" value={data.lastName} onChange={(e) => upd("lastName", e.target.value)} required />
          </div>
          <FormInput label="Email" type="email" value={data.email} onChange={(e) => upd("email", e.target.value)} required />
          <FormInput label="Contraseña" type="password" value={data.password} onChange={(e) => upd("password", e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Localidad</label>
            <select value={data.locationId} onChange={(e) => setData({ ...data, locationId: Number(e.target.value), universityId: 0 })} required
              className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value={0}>Selecciona localidad</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.city}, {l.state}, {l.country}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Universidad (opcional)</label>
            <select value={data.universityId} onChange={(e) => upd("universityId", Number(e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value={0}>Sin universidad</option>
              {visibleUnis.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button disabled={loading} className="w-full h-11 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-5">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline">Entra</Link>
        </p>
      </div>
    </div>
  );
}
