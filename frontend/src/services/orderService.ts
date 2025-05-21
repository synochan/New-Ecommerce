import { getAuthHeaders } from '../utils/auth';

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  shipping_address: string;
  payment_status: 'P' | 'C' | 'F';
  total_price: number;
  created_at: string;
}

export const fetchUserOrders = async (): Promise<Order[]> => {
  const response = await fetch('http://localhost:8000/api/users/me/orders/', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
}; 