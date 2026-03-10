// src/types/review.ts
export interface Review {
  id: string;
  productId: string;
  userId: string; // Assuming user is logged in and their ID is available
  rating: number; // 1-5
  comment: string;
  createdAt: Date; // Or string representation from API
}
