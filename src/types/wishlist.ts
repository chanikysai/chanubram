
import { Product } from './product'; // Assuming Product type exists and is imported from './product'

// Interface for an item specifically in the wishlist, potentially with extra info
export interface WishlistItem extends Product {
  wishlistId: string; // Unique identifier for this entry in the wishlist
  addedAt: string;    // Timestamp when added
}
