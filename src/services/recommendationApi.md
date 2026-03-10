# Mock API Services

This directory contains mock implementations of API services used for development and testing purposes.

## `recommendationApi.ts`

Provides a mock function for fetching product recommendations.

-   `getRecommendations(productId: string)`: Returns an array of recommended `Product` objects based on the provided `productId`.

This mock simulates network delays and uses hardcoded data to provide recommendations. It implements a basic "customers who viewed this also viewed..." logic as a placeholder for a more complex recommendation engine.
