import { getProducts, addProduct, editProduct, deleteProduct } from '../services/adminProductApi';

// Mock the fetch API
global.fetch = jest.fn();

const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'A test product for testing',
    price: 19.99,
    stock: 100,
};

const mockNewProductDetails = {
    name: 'New Product',
    description: 'A brand new product',
    price: 29.99,
    stock: 50,
};

const mockUpdatedProductDetails = {
    name: 'Updated Test Product',
    description: 'An updated test product',
    price: 24.99,
    stock: 75,
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('adminProductApi', () => {
    // Happy Path Test Case 1: getProducts
    it('should fetch products successfully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [mockProduct],
        });

        const products = await getProducts();
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/api/admin/products');
        expect(products).toEqual([mockProduct]);
        expect(products.length).toBe(1);
    });

    // Happy Path Test Case 2: addProduct
    it('should add a product successfully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: '2', ...mockNewProductDetails }),
        });

        const newProduct = await addProduct(mockNewProductDetails);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockNewProductDetails),
        });
        expect(newProduct).toEqual({ id: '2', ...mockNewProductDetails });
    });

    // Happy Path Test Case 3: editProduct
    it('should edit a product successfully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: mockProduct.id, ...mockUpdatedProductDetails }),
        });

        const updatedProduct = await editProduct(mockProduct.id, mockUpdatedProductDetails);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`/api/admin/products/${mockProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockUpdatedProductDetails),
        });
        expect(updatedProduct).toEqual({ id: mockProduct.id, ...mockUpdatedProductDetails });
    });

    // Happy Path Test Case 4: deleteProduct
    it('should delete a product successfully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
        });

        await deleteProduct(mockProduct.id);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`/api/admin/products/${mockProduct.id}`, {
            method: 'DELETE',
        });
    });

    // Edge Case Test Case 5: getProducts returns empty array
    it('should return an empty array when no products are available', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const products = await getProducts();
        expect(products).toEqual([]);
        expect(products.length).toBe(0);
    });

    // Error Handling Test Case 6: getProducts fails
    it('should throw an error if fetching products fails', async () => {
        const errorResponse = { message: 'Network Error' };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => errorResponse,
            status: 500,
        });

        await expect(getProducts()).rejects.toThrow('Failed to fetch products');
    });

    // Error Handling Test Case 7: addProduct fails
    it('should throw an error if adding a product fails', async () => {
        const errorResponse = { message: 'Invalid input' };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => errorResponse,
            status: 400,
        });

        await expect(addProduct(mockNewProductDetails)).rejects.toThrow('Failed to add product');
    });

    // Error Handling Test Case 8: editProduct fails
    it('should throw an error if editing a product fails', async () => {
        const errorResponse = { message: 'Product not found' };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => errorResponse,
            status: 404,
        });

        await expect(editProduct(mockProduct.id, mockUpdatedProductDetails)).rejects.toThrow('Failed to edit product');
    });

    // Error Handling Test Case 9: deleteProduct fails
    it('should throw an error if deleting a product fails', async () => {
        const errorResponse = { message: 'Cannot delete product' };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => errorResponse,
            status: 400,
        });

        await expect(deleteProduct(mockProduct.id)).rejects.toThrow('Failed to delete product');
    });
});
