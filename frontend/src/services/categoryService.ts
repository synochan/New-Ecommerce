import { getAuthHeaders } from '../utils/auth';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch('http://localhost:8000/api/categories/', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}; 