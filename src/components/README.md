# Components

This directory contains reusable UI components for the application.

## `ProductCard.tsx`

A component to display a summary of a product, typically used in lists or recommendation sections.
It shows the product image, name, price, and a link to view details.

## `ProductDetail.tsx`

A component to display the full details of a single product, including image, name, description, and price.

## `Recommendations.tsx`

Displays a list of recommended products to the user.
It fetches recommendations using `recommendationApi.ts` and renders them using `ProductCard.tsx`. Handles loading, error, and empty states.

## `ReviewForm.tsx`

A form component allowing users to submit a product review, including rating and comments.
It handles input validation and submission logic.

## `ReviewDisplay.tsx`

A component that displays a list of customer reviews for a product, along with the average rating.
It iterates through provided reviews and shows details like rating, comment, and date.
