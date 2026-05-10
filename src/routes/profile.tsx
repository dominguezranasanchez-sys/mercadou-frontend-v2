import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { ProductsAPI } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";
import { Loader, EmptyState } from "@/components/Loader";
import { formatLocation } from "@/utils/format";
import type { Product } from "@/data/mock";
import { Star } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Mi perfil — Markety" }] }),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const { locations } = useProducts();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    ProductsAPI.bySeller(user.id).then((p) => { setItems(p); setLoading(false); });
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  const loc = locations.find((l) => l.id === user.locationId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
        <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{user.firstName} {user.lastName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">{formatLocation(loc)}</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Star className="h-4 w-4 fill-accent-foreground text-accent-foreground" />
          {user.averageRating.toFixed(1)}
        </div>
      </div>

      <h2 className="text-lg font-bold text-foreground mt-8 mb-4">Mis publicaciones ({items.length})</h2>
      {loading ? <Loader />
        : items.length === 0 ? <EmptyState title="Aún no publicas nada" description="Crea tu primera publicación." />
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>}
    </div>
  );
}
