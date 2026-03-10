import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/HomePage';
import CartPage from '../pages/CartPage';
import ProductPage from '../pages/ProductPage'; // Use the actual component for testing

// Mock ProductPage directly to control its behavior for this test
jest.mock('../pages/ProductPage', () => ({
  __esModule: true,
  default: jest.fn(({ productId }) => (
    <div data-testid="product-page" data-productid={productId}>
      Product Page for: {productId || 'No ID'}
    </div>
  )),
}));

describe('App Routing', () => {
  it('navigates to HomePage for root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Welcome to Our Store')).toBeInTheDocument();
  });

  it('navigates to CartPage for /cart path', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('navigates to ProductPage for /products/:productId path and passes productId', () => {
    const productId = 'p1';
    render(
      <MemoryRouter initialEntries={[`/products/${productId}`]}>
        <App />
      </MemoryRouter>
    );

    // Check if the mocked ProductPage received the correct productId
    const mockedProductPage = screen.getByTestId('product-page');
    expect(mockedProductPage).toBeInTheDocument();
    expect(mockedProductPage).toHaveAttribute('data-productid', productId);
  });

  it('navigates to a different ProductPage for another product ID', () => {
    const productId = 'p2';
    render(
      <MemoryRouter initialEntries={[`/products/${productId}`]}>
        <App />
      </MemoryRouter>
    );
    const mockedProductPage = screen.getByTestId('product-page');
    expect(mockedProductPage).toHaveAttribute('data-productid', productId);
  });

  it('renders 404 or a fallback for unknown paths', () => {
    // Mocking a simple 404 component or checking for absence of known content
    render(
      <MemoryRouter initialEntries={['/unknown-page']}>
        <App />
      </MemoryRouter>
    );
    // Expecting no content from HomePage, CartPage, or ProductPage
    // In a real app, you'd have a specific 404 component.
    // For now, we check for absence of known elements.
    expect(screen.queryByText('Welcome to Our Store')).not.toBeInTheDocument();
    expect(screen.queryByText('Shopping Cart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-page')).not.toBeInTheDocument();
  });
});
