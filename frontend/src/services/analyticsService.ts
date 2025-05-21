import { getAuthHeaders } from '../utils/auth';

export interface Analytics {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_users: number;
  recent_orders: Array<{
    id: string;
    total_price: number;
    created_at: string;
    user: {
      email: string;
      name: string;
    };
  }>;
  top_products: Array<{
    id: string;
    name: string;
    price: number;
    total_sold: number;
  }>;
  sales_by_category: Record<string, number>;
  daily_revenue: Array<{
    date: string;
    revenue: number;
  }>;
}

export const fetchDashboardAnalytics = async (): Promise<Analytics> => {
  const response = await fetch('http://localhost:8000/api/analytics/dashboard/', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return response.json();
}; 