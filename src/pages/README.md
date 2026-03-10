# Pages

This directory contains the main page components of the application.

## `ProductPage.tsx`

This page displays detailed information about a specific product.
It fetches product data using `productApi.ts` and associated reviews using `reviewApi.ts`.
It includes sections for:
-   Product details (image, name, description, price)
-   Product recommendations (using the `Recommendations.tsx` component)
-   Customer reviews (using `ReviewForm.tsx` and `ReviewDisplay.tsx`)
It assumes the use of `react-router-dom` for retrieving the `productId` from the URL.
