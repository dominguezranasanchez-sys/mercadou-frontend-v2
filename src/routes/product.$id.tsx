import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, MapPin, Star } from "lucide-react";
import { ProductsAPI, UsersAPI, FavoritesAPI, ChatAPI } from "@/services/api";
import { useProducts } from "@/context/ProductContext";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/Loader";
import { formatLocation, formatPrice } from "@/utils/format";
import type { Product, User } from "@/data/mock";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { categories, locations } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [active, setActive] = useState(0);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true);
    const p = await ProductsAPI.get(Number(id));
    setProduct(p);
    if (p) {
      setSeller(await UsersAPI.get(p.sellerId));
      if (user) setFav(FavoritesAPI.isFav(user.id, p.id));
    }
    setLoading(false);
  })(); }, [id, user]);

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-muted-foreground">Producto no encontrado</div>;

  const images = ProductsAPI.imagesFor(product.id);
  const cat = categories.find((c) => c.id === product.categoryId);
  const loc = locations.find((l) => l.id === product.locationId);
  const sellerLoc = seller && locations.find((l) => l.id === seller.locationId);

  const contact = async () => {
    if (!user) { navigate({ to: "/login" }); return; }
    const convo = await ChatAPI.startWithSeller(user.id, product.sellerId, product.id);
    await ChatAPI.send(convo.id, user.id, `Hola, me interesa "${product.title}".`);
    navigate({ to: "/chat" });
  };

  const toggleFav = async () => { if (!user) return; setFav(await FavoritesAPI.toggle(user.id, product.id)); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1.2fr_1fr] gap-8">
      <div>
        <div className="aspect-square bg-muted rounded-xl overflow-hidden">
          <img src={images[active]?.url} alt={product.title} className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-cols-5 gap-2 mt-3">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`aspect-square rounded-md overflow-hidden border-2 transition ${i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">{cat?.name}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">{product.title}</h1>
          <p className="text-3xl font-bold text-foreground mt-3">{formatPrice(product.price)}</p>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {formatLocation(loc)}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={contact} className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
            Contactar al vendedor
          </button>
          {user && (
            <button onClick={toggleFav} className="h-12 w-12 rounded-full border border-border hover:bg-secondary flex items-center justify-center transition">
              <Heart className={`h-5 w-5 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
            </button>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-foreground mb-2">Descripción</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
        </div>

        {seller && (
          <Link to="/user/$id" params={{ id: String(seller.id) }}
            className="block bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {seller.firstName.charAt(0)}{seller.lastName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{seller.firstName} {seller.lastName}</p>
                <p className="text-xs text-muted-foreground">{formatLocation(sellerLoc)}</p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-accent-foreground text-accent-foreground" />
                <span className="font-medium">{seller.averageRating.toFixed(1)}</span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
