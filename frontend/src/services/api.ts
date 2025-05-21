import { mockCategories, mockProducts } from './mockData';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: number;
  category: number;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  available: boolean;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  items: OrderItem[];
  total_amount: number;
  status: string;
  shipping_address: string;
  payment_id: string;
  created_at: string;
}

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API calls
export const getCategories = async () => {
  await delay(500); // Simulate network delay
  return { data: mockCategories };
};

export const getProducts = async (categorySlug?: string) => {
  await delay(800); // Simulate network delay
  let filteredProducts = [...mockProducts];
  
  if (categorySlug) {
    const category = mockCategories.find(c => c.slug === categorySlug);
    if (category) {
      filteredProducts = mockProducts.filter(p => p.category === category.id);
    }
  }
  
  return { data: filteredProducts };
};

export const getProduct = async (slug: string) => {
  await delay(500); // Simulate network delay
  const product = mockProducts.find(p => p.slug === slug);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return { data: product };
};

// These will be implemented later when we connect to the backend
export const getOrders = async () => {
  return { data: [] };
};

export const createOrder = async (_orderData: Partial<Order>) => {
  throw new Error('Not implemented');
};

export const createPaymentIntent = async (_amount: number) => {
  throw new Error('Not implemented');
}; 