import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { ProductsAPI } from "@/services/api";
import { FormInput } from "@/components/FormInput";
import { ImagePlus } from "lucide-react";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "Vender — Markety" }] }),
  component: CreateProduct,
});

function CreateProduct() {
  const { user } = useAuth();
  const { categories, locations, universities, refresh } = useProducts();
  const navigate = useNavigate();
  const [data, setData] = useState({
    title: "", 
    description: "", 
    price: 0,
    categoryId: 0,
    locationId: user?.locationId ?? 0,
    universityId: user?.universityId ?? 0,
    condition: "New"
  });
  const [imgs, setImgs] = useState<string[]>([`https://picsum.photos/seed/new${Date.now()}/600/600`]);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <Navigate to="/login" />;

  const upd = (k: keyof typeof data, v: string | number) => setData({ ...data, [k]: v });

  const visibleUnis = data.locationId
    ? universities.filter((u) => u.locationId === data.locationId)
    : universities;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!data.title || !data.description || data.price <= 0 || !data.categoryId || !data.locationId) {
      setErr("Completa todos los campos."); return;
    }
    setSubmitting(true);
    try {
      const p = await ProductsAPI.create({
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        locationId: data.locationId,
        universityId: data.universityId || null,
        sellerId: user.id,
        condition: data.condition,
      });
      await Promise.all(imgs.map((url, i) => ProductsAPI.addImage(p.id, url, i === 0)));
      await refresh();
      navigate({ to: "/product/$id", params: { id: String(p.id) } });
    } catch (e) {
      setErr((e as Error).message ?? "No se pudo publicar.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Crear publicación</h1>
      <form onSubmit={submit} className="mt-6 bg-card border border-border rounded-2xl p-6 space-y-5">
        <FormInput label="Título" value={data.title} onChange={(e) => upd("title", e.target.value)} placeholder="Ej. iPhone 13 Pro 128GB" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Descripción</label>
          <textarea value={data.description} onChange={(e) => upd("description", e.target.value)} rows={4}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Precio" type="number" value={data.price || ""} onChange={(e) => upd("price", Number(e.target.value))} />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Condición</label>
            <select value={data.condition} onChange={(e) => upd("condition", e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="New">Nuevo</option>
              <option value="Good">Usado (Buen estado)</option>
              <option value="Fair">Usado (Detalles de uso)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Categoría</label>
            <select value={data.categoryId} onChange={(e) => upd("categoryId", Number(e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value={0}>Selecciona</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Localidad</label>
            <select value={data.locationId}
              onChange={(e) => setData({ ...data, locationId: Number(e.target.value), universityId: 0 })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value={0}>Selecciona</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.city}, {l.state}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Universidad (opcional)</label>
          <select value={data.universityId} onChange={(e) => upd("universityId", Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value={0}>Sin universidad</option>
            {visibleUnis.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Imágenes (simuladas)</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imgs.map((u, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden bg-muted">
                <img src={u} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {imgs.length < 3 && (
              <button type="button" onClick={() => setImgs([...imgs, `https://picsum.photos/seed/x${Date.now()}-${imgs.length}/600/600`])}
                className="aspect-square rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary transition">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs mt-1">Agregar</span>
              </button>
            )}
          </div>
        </div>

        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={submitting} className="w-full h-11 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50">
          {submitting ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}