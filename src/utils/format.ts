import type { Location } from "@/data/mock";

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

export const formatLocation = (l?: Location | null) => (l ? `${l.city}, ${l.state}` : "—");
