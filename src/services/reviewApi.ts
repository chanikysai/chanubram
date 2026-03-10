// src/services/reviewApi.ts

export interface Review {
  id: string;
  productId: string;
  userId: string; // Assuming user ID is available
  rating: number;
  comment: string;
  createdAt: string;
}

interface SubmitReviewResponse {
  success: boolean;
  review?: Review;
  error?: string;
}

interface FetchReviewsResponse {
  reviews: Review[];
  averageRating: number;
}

const API_BASE_URL = '/api/reviews'; // Assuming a base URL for reviews API

export const submitReview = async (
  productId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<SubmitReviewResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, rating, comment }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit review');
    }

    const data: Review = await response.json();
    return { success: true, review: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchReviewsByProductId = async (
  productId: string
): Promise<FetchReviewsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reviews');
    }

    // Assuming the backend returns an object with reviews and averageRating
    const data: FetchReviewsResponse = await response.json();
    return data;
  } catch (error: any) {
    // Return empty for errors to allow UI to render gracefully
    console.error('Error fetching reviews:', error);
    return { reviews: [], averageRating: 0 };
  }
};
