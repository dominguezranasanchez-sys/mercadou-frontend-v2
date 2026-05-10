import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect } from "react";
import { useProducts, type Filters } from "@/context/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { FiltersSidebar } from "@/components/FiltersSidebar";
import { Loader, EmptyState } from "@/components/Loader";

// Schema de search params -> URL refleja los filtros (Universidad, Localidad, etc.)
const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  categoryId: fallback(z.number().int().positive().optional(), undefined),
  locationId: fallback(z.number().int().positive().optional(), undefined),
  universityId: fallback(z.number().int().positive().optional(), undefined),
  minPrice: fallback(z.number().nonnegative().optional(), undefined),
  maxPrice: fallback(z.number().nonnegative().optional(), undefined),
});

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Buscar — Markety" }] }),
  validateSearch: zodValidator(searchSchema),
  component: Search,
});

function Search() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { products, loading, filters, setFilters } = useProducts();

  // 1) URL -> contexto: cuando cambian los search params, sincronizamos filtros.
  useEffect(() => {
    const next: Filters = {
      q: search.q || undefined,
      categoryId: search.categoryId,
      locationId: search.locationId,
      universityId: search.universityId,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
    };
    setFilters(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.q, search.categoryId, search.locationId, search.universityId, search.minPrice, search.maxPrice]);

  // 2) Contexto -> URL: cuando el usuario cambia un filtro desde el sidebar
  // (FiltersSidebar / SearchBar editan `filters` en el context), reflejamos en la URL.
  useEffect(() => {
    navigate({
      search: () => ({
        q: filters.q ?? "",
        categoryId: filters.categoryId,
        locationId: filters.locationId,
        universityId: filters.universityId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.categoryId, filters.locationId, filters.universityId, filters.minPrice, filters.maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[260px_1fr] gap-6">
      <FiltersSidebar />
      <section>
        <h1 className="text-xl font-bold mb-4 text-foreground">{products.length} resultados</h1>
        {loading ? <Loader />
          : products.length === 0 ? <EmptyState title="Sin resultados" description="Prueba ajustando los filtros." />
          : <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>}
      </section>
    </div>
  );
}
