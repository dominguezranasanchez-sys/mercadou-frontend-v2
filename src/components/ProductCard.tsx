import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/data/mock";
import { ProductsAPI, FavoritesAPI } from "@/services/api";
import { useProducts } from "@/context/ProductContext";
import { useAuth } from "@/context/AuthContext";
import { formatLocation, formatPrice } from "@/utils/format";
import { useEffect, useState } from "react";

export function ProductCard({ product, onFavToggle }: { product: Product; onFavToggle?: () => void }) {
  const { locations } = useProducts();
  const { user } = useAuth();
  const loc = locations.find((l) => l.id === product.locationId);
  const [primary, setPrimary] = useState<string | undefined>(
    ProductsAPI.imagesFor(product.id).find((i) => i.isPrimary)?.url
  );
  const [fav, setFav] = useState(user ? FavoritesAPI.isFav(user.id, product.id) : false);

  useEffect(() => {
    if (primary) return;
    let active = true;
    ProductsAPI.loadImages(product.id)
      .then((imgs) => { if (active) setPrimary((imgs.find((i) => i.isPrimary) ?? imgs[0])?.url); })
      .catch(() => {});
    return () => { active = false; };
  }, [product.id, primary]);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    const isFav = await FavoritesAPI.toggle(user.id, product.id);
    setFav(isFav);
    onFavToggle?.();
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: String(product.id) }}
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      <div className="aspect-square bg-muted overflow-hidden relative">
        {primary && (
          <img src={primary} alt={product.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
        {user && (
          <button onClick={toggleFav}
            className="absolute top-2 right-2 h-9 w-9 rounded-full bg-card/90 backdrop-blur flex items-center justify-center hover:bg-card shadow-sm transition"
            aria-label="Favorito">
            <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
          </button>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
        <h3 className="text-sm text-foreground line-clamp-2">{product.title}</h3>
        <p className="text-xs text-muted-foreground mt-auto pt-1">{formatLocation(loc)}</p>
      </div>
    </Link>
  );
}
