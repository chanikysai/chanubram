# Mock API Services

This directory contains mock implementations of API services used for development and testing purposes.

## `productApi.ts`

Provides mock functions to simulate fetching product data.

-   `getProductById(id: string)`: Returns a `Product` object for a given ID or throws an error if not found.

## `reviewApi.ts`

Provides mock functions for managing product reviews.

-   `getReviews(productId: string)`: Returns an array of `Review` objects for a given product ID.
-   `submitReview(productId: string, userId: string, rating: number, comment: string)`: Simulates submitting a new review and returns the created review object.
-   `calculateAverageRating(reviews: Review[])`: Calculates the average rating from a list of reviews.

## `recommendationApi.ts`

Provides a mock function for fetching product recommendations.

-   `getRecommendations(productId: string)`: Returns an array of recommended `Product` objects based on the provided `productId`.

All mock APIs simulate network delays using `setTimeout` and use in-memory data that can be reset for testing.
