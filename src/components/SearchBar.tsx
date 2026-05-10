import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/context/ProductContext";
import { useNavigate, useLocation } from "@tanstack/react-router";

export function SearchBar({ onSearch }: { onSearch?: (q: string) => void }) {
  const { filters, setFilters } = useProducts();
  const [val, setVal] = useState(filters.q ?? "");
  const debounced = useDebounce(val, 350);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setFilters({ ...filters, q: debounced || undefined });
    onSearch?.(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== "/search") {
      navigate({ to: "/search", search: { q: val, categoryId: undefined, locationId: undefined, universityId: undefined, minPrice: undefined, maxPrice: undefined } });
    }
  };

  return (
    <form onSubmit={submit} className="flex-1 max-w-2xl relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Buscar en el marketplace..."
        className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary border border-transparent focus:bg-card focus:border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
      />
    </form>
  );
}
