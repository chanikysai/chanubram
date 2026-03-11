import React from 'react';
import { WishlistItem } from '../types/wishlist'; // Import the WishlistItem type
import './WishlistItem.css'; // Assuming CSS for styling

// Placeholder for product image if imageUrl is missing or invalid
const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/100';

interface WishlistItemProps {
  item: WishlistItem;
  onRemove: (wishlistItemId: string) => void;
  onMoveToCart: (item: WishlistItem) => void; // Pass the whole item for potential cart operations
}

const WishlistItemComponent: React.FC<WishlistItemProps> = ({ item, onRemove, onMoveToCart }) => {
  const imageUrl = item.imageUrl || PLACEHOLDER_IMAGE_URL;

  const handleRemoveClick = () => {
    onRemove(item.wishlistId); // Use wishlistId for removal
  };

  const handleMoveToCartClick = () => {
    onMoveToCart(item); // Pass the item to move to cart
  };

  return (
    <div className="wishlist-item" style={{
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <img
        src={imageUrl}
        alt={item.name}
        style={{
          width: '100px',
          height: '100px',
          objectFit: 'cover',
          borderRadius: '4px',
          marginRight: '20px',
        }}
      />
      <div className="wishlist-item__details" style={{ flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.2em', margin: '0 0 5px 0', color: '#333' }}>
          {item.name}
        </h3>
        <p style={{ fontSize: '1em', color: '#007bff', fontWeight: 'bold', margin: '0 0 10px 0' }}>
          ${item.price.toFixed(2)}
        </p>
        {/* Optionally display addedAt or other wishlist specific info */}
        {/* <p style={{ fontSize: '0.8em', color: '#777' }}>Added: {new Date(item.addedAt).toLocaleDateString()}</p> */}
      </div>
      <div className="wishlist-item__actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={handleMoveToCartClick}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.9em',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
          aria-label={`Move ${item.name} to cart`}
        >
          Move to Cart
        </button>
        <button
          onClick={handleRemoveClick}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.9em',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#c82333')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
          aria-label={`Remove ${item.name} from wishlist`}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default WishlistItemComponent;
