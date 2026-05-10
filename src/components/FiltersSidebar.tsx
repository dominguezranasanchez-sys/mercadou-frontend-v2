import { useProducts } from "@/context/ProductContext";

export function FiltersSidebar() {
  const { filters, setFilters, categories, locations, universities } = useProducts();

  const update = (patch: Partial<typeof filters>) => setFilters({ ...filters, ...patch });

  // Universidades filtradas por la localidad seleccionada (si hay)
  const visibleUnis = filters.locationId
    ? universities.filter((u) => u.locationId === filters.locationId)
    : universities;

  return (
    <aside className="bg-card border border-border rounded-xl p-5 space-y-5 sticky top-20 h-fit">
      <h2 className="font-semibold text-foreground">Filtros</h2>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoría</label>
        <select
          value={filters.categoryId ?? ""}
          onChange={(e) => update({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
          className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="">Todas</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Localidad</label>
        <select
          value={filters.locationId ?? ""}
          onChange={(e) => update({
            locationId: e.target.value ? Number(e.target.value) : undefined,
            // Si cambia la localidad, descartamos universidad si ya no encaja
            universityId: undefined,
          })}
          className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="">Todas</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.city}, {l.state}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Universidad</label>
        <select
          value={filters.universityId ?? ""}
          onChange={(e) => update({ universityId: e.target.value ? Number(e.target.value) : undefined })}
          className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="">Todas</option>
          {visibleUnis.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Precio</label>
        <div className="flex gap-2 mt-1.5">
          <input type="number" placeholder="Mín" value={filters.minPrice ?? ""}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" />
          <input type="number" placeholder="Máx" value={filters.maxPrice ?? ""}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" />
        </div>
      </div>

      <button onClick={() => setFilters({})}
        className="w-full h-9 text-sm font-medium text-primary hover:bg-accent rounded-md transition">
        Limpiar filtros
      </button>
    </aside>
  );
}
