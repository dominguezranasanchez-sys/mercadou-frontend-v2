import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { FavoritesAPI } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";
import { Loader, EmptyState } from "@/components/Loader";
import type { Product } from "@/data/mock";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favoritos — Markety" }] }),
  component: Favorites,
});

function Favorites() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    FavoritesAPI.list(user.id).then((p) => { setItems(p); setLoading(false); });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Mis favoritos</h1>
      {loading ? <Loader />
        : items.length === 0 ? <EmptyState title="Sin favoritos" description="Guarda productos para verlos aquí." />
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => <ProductCard key={p.id} product={p} onFavToggle={load} />)}
          </div>}
    </div>
  );
}
