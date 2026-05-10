import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts } from "@/context/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { Loader, EmptyState } from "@/components/Loader";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Markety — Marketplace" }, { name: "description", content: "Descubre productos cerca de ti." }] }),
  component: Home,
});

function Home() {
  const { products, loading, categories } = useProducts();
  const featured = products.slice(0, 8);
  const topCategories = categories.filter((c) => c.parentCategoryId === null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground p-8 md:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">Compra y vende cerca de ti</h1>
          <p className="mt-2 text-primary-foreground/90">Productos de tu universidad y tu localidad.</p>
          <Link to="/create" className="mt-5 inline-flex items-center gap-2 bg-card text-foreground px-5 h-11 rounded-full font-medium hover:scale-105 transition">
            Vender ahora
          </Link>
        </div>
      </section>

      {topCategories.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Categorías</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {topCategories.map((c) => (
              <Link
                key={c.id}
                to="/search"
                search={{ q: "", categoryId: c.id, locationId: undefined, universityId: undefined, minPrice: undefined, maxPrice: undefined }}
                className="shrink-0 px-4 h-9 rounded-full border bg-card border-border hover:border-primary/40 text-sm transition flex items-center"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recientes</h2>
          <Link to="/search" className="text-sm text-primary hover:underline">Ver todo</Link>
        </div>
        {loading ? <Loader />
          : featured.length === 0 ? <EmptyState title="Sin productos" description="Aún no hay publicaciones." />
          : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>}
      </section>
    </div>
  );
}
