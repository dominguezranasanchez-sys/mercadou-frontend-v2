import axios from "axios";
import type {
  Product, Message, User, Category, Location, University,
  ProductImage, Conversation, Review,
} from "@/data/mock";

// Cliente Axios para el backend ASP.NET Core.
// Setear VITE_API_URL para apuntar al backend (ej: https://localhost:7001/api)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============================================================
// INTERCEPTOR GLOBAL DE ERRORES (Traducción a mensajes amigables)
// ============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        alert("⚠️ Por favor revisa los datos: faltan campos o el formato es incorrecto.");
      } else if (status === 409) {
        alert("⚠️ Este correo ya está registrado. Intenta iniciar sesión o usa otro correo.");
      } else if (status === 401) {
        alert("🔒 Tu sesión expiró o las credenciales son incorrectas.");
      } else if (status >= 500) {
        alert("🔌 Ups, tenemos problemas técnicos en el servidor. Intenta de nuevo más tarde.");
      }
    } else {
      alert("📡 Error de conexión. Revisa tu internet y que el servidor esté encendido.");
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Filtros
// ============================================================
export interface ProductListParams {
  q?: string;
  categoryId?: number;
  locationId?: number;
  universityId?: number;
  minPrice?: number;
  maxPrice?: number;
}

// ============================================================
// Caché ligera de imágenes para ProductCard / detalle
// (rellenada por el backend al cargar productos / al crearlos).
// ============================================================
const imageCache = new Map<number, ProductImage[]>();

function cacheImages(productId: number, imgs: ProductImage[]) {
  imageCache.set(productId, imgs);
}

// ============================================================
// Productos
// ============================================================
export const ProductsAPI = {
  async list(params?: ProductListParams) {
    const { data } = await api.get<Product[]>("/products", { params });
    return data;
  },
  async get(id: number) {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },
  async create(p: Omit<Product, "id" | "createdAt" | "status">) {
    const { data } = await api.post<Product>("/products", p);
    return data;
  },
  async bySeller(sellerId: number) {
    const { data } = await api.get<Product[]>(`/users/${sellerId}/products`);
    return data;
  },
  async loadImages(productId: number) {
    const { data } = await api.get<ProductImage[]>(`/products/${productId}/images`);
    cacheImages(productId, data);
    return data;
  },
  imagesFor(productId: number): ProductImage[] {
    return imageCache.get(productId) ?? [];
  },
  async addImage(productId: number, url: string, isPrimary = false) {
    const { data } = await api.post<ProductImage>(`/products/${productId}/images`, { url, isPrimary });
    const list = imageCache.get(productId) ?? [];
    list.push(data);
    imageCache.set(productId, list);
    return data;
  },
};

// ============================================================
// Catálogos
// ============================================================
export const CategoriesAPI = {
  async list() {
    const { data } = await api.get<Category[]>("/categories");
    return data;
  },
};

export const LocationsAPI = {
  async list() {
    const { data } = await api.get<Location[]>("/locations");
    return data;
  },
};

export const UniversitiesAPI = {
  async list(params?: { locationId?: number }) {
    const { data } = await api.get<University[]>("/universities", { params });
    return data;
  },
};

// ============================================================
// Usuarios y autenticación
// ============================================================
export const UsersAPI = {
  async get(id: number) {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },
  async login(email: string, password: string) {
    const { data } = await api.post<{ user: User; token: string }>("/auth/login", { email, password });
    return data;
  },
  async register(payload: {
    firstName: string; lastName: string; email: string; password: string;
    locationId: number; universityId?: number;
  }) {
    const { data } = await api.post<{ user: User; token: string }>("/auth/register", payload);
    return data;
  },
  async reviewsFor(userId: number) {
    const { data } = await api.get<Review[]>(`/users/${userId}/reviews`);
    return data;
  },
};

// ============================================================
// Favoritos
// ============================================================
const favCache = new Set<string>(); // `${userId}:${productId}`
const favKey = (u: number, p: number) => `${u}:${p}`;

export const FavoritesAPI = {
  async list(userId: number) {
    const { data } = await api.get<Product[]>(`/users/${userId}/favorites`);
    favCache.clear();
    data.forEach((p) => favCache.add(favKey(userId, p.id)));
    return data;
  },
  async toggle(userId: number, productId: number) {
    const { data } = await api.post<{ active: boolean }>(`/users/${userId}/favorites/${productId}`);
    if (data.active) favCache.add(favKey(userId, productId));
    else favCache.delete(favKey(userId, productId));
    return data.active;
  },
  isFav(userId: number, productId: number) {
    return favCache.has(favKey(userId, productId));
  },
};

// ============================================================
// Chat
// ============================================================
export const ChatAPI = {
  async conversations(userId: number) {
    const { data } = await api.get<Conversation[]>(`/users/${userId}/conversations`);
    return data;
  },
  async messages(conversationId: number) {
    const { data } = await api.get<Message[]>(`/conversations/${conversationId}/messages`);
    return data;
  },
  async send(conversationId: number, senderId: number, content: string) {
    const { data } = await api.post<Message>(`/conversations/${conversationId}/messages`, { senderId, content });
    return data;
  },
  async startWithSeller(buyerId: number, sellerId: number, productId: number) {
    const { data } = await api.post<Conversation>("/conversations", { buyerId, sellerId, productId });
    return data;
  },
};