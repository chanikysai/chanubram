// src/types/review.ts
export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number; // e.g., 1-5
  comment: string;
  createdAt: string; // ISO format date string
}
