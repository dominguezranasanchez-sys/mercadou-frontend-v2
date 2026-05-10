import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CategoriesAPI, LocationsAPI, ProductsAPI, UniversitiesAPI } from "@/services/api";
import type { Category, Location, Product, University } from "@/data/mock";

export interface Filters {
  q?: string;
  categoryId?: number;
  locationId?: number;
  universityId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface Ctx {
  products: Product[];
  categories: Category[];
  locations: Location[];
  universities: University[];
  loading: boolean;
  filters: Filters;
  setFilters: (f: Filters) => void;
  refresh: () => Promise<void>;
}

const C = createContext<Ctx | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setProducts(await ProductsAPI.list(filters)); }
    catch { setProducts([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { (async () => {
    try {
      const [c, l, u] = await Promise.all([
        CategoriesAPI.list(),
        LocationsAPI.list(),
        UniversitiesAPI.list(),
      ]);
      setCategories(c); setLocations(l); setUniversities(u);
    } catch {
      setCategories([]); setLocations([]); setUniversities([]);
    }
  })(); }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <C.Provider value={{ products, categories, locations, universities, loading, filters, setFilters, refresh }}>
      {children}
    </C.Provider>
  );
}

export function useProducts() {
  const c = useContext(C);
  if (!c) throw new Error("useProducts must be used inside ProductProvider");
  return c;
}
