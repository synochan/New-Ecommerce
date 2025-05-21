import { getAuthHeaders } from '../utils/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  email_confirmed: boolean;
}

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('http://localhost:8000/api/users/', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}; 