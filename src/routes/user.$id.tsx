import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { ProductsAPI, UsersAPI } from "@/services/api";
import { useProducts } from "@/context/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { Loader } from "@/components/Loader";
import { formatLocation } from "@/utils/format";
import type { Product, Review, User } from "@/data/mock";

export const Route = createFileRoute("/user/$id")({
  component: UserPage,
});

function UserPage() {
  const { id } = Route.useParams();
  const { locations } = useProducts();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true);
    try {
      const u = await UsersAPI.get(Number(id));
      setUser(u);
      if (u) {
        const [its, rvs] = await Promise.all([
          ProductsAPI.bySeller(u.id),
          UsersAPI.reviewsFor(u.id).catch(() => [] as Review[]),
        ]);
        setItems(its);
        setReviews(rvs);
      }
    } finally { setLoading(false); }
  })(); }, [id]);

  if (loading) return <Loader />;
  if (!user) return <div className="text-center py-20 text-muted-foreground">Usuario no encontrado</div>;
  const loc = locations.find((l) => l.id === user.locationId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
        <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{user.firstName} {user.lastName}</h1>
          <p className="text-sm text-muted-foreground">{formatLocation(loc)}</p>
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} reseñas</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Star className="h-4 w-4 fill-accent-foreground text-accent-foreground" />
          {user.averageRating.toFixed(1)}
        </div>
      </div>

      <h2 className="text-lg font-bold text-foreground mt-8 mb-4">Publicaciones de {user.firstName}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
