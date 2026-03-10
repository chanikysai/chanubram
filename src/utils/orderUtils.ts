import type { Order } from '../types/order';

export const getStatusColor = (status: Order['status']): string => {
  switch (status) {
    case 'Processing': return '#FFA500'; // Orange
    case 'Shipped': return '#1E90FF'; // Dodger Blue
    case 'Delivered': return '#32CD32'; // Lime Green
    case 'Cancelled': return '#DC143C'; // Crimson
    default: return '#808080'; // Grey
  }
};
