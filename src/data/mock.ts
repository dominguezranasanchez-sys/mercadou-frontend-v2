// Tipos alineados con el modelo SQL Server.
// NOTA: Sin datos de prueba — los datos vienen del backend ASP.NET Core vía services/api.ts.
export interface Location { id: number; country: string; state: string; city: string; }
export interface University { id: number; name: string; locationId: number; }
export interface Category { id: number; name: string; parentCategoryId: number | null; }
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  locationId: number;
  universityId?: number | null;
  averageRating: number;
  avatarUrl?: string;
}
export interface ProductImage { productId: number; url: string; isPrimary: boolean; }
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  sellerId: number;
  categoryId: number;
  locationId: number;
  universityId?: number | null;
  status: "active" | "sold" | "paused";
  createdAt: string;
  condition: string;
}
export interface Conversation { id: number; buyerId: number; sellerId: number; productId: number; }
export interface Message { id: number; conversationId: number; senderId: number; content: string; sentAt: string; }
export interface Favorite { userId: number; productId: number; }
export interface Review { id: number; authorId: number; reviewedUserId: number; rating: number; comment: string; }
