import { PRODUCTS } from './mockData';

const API_URL = '/api';

export const loginUser = async (phone, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  
  const data = await res.json();
  if (!res.ok) {
     throw new Error(data.error || 'API login failed');
  }
  return data;
};

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  const data = await res.json();
  if (!res.ok) {
     throw new Error(data.error || 'API register failed');
  }
  return data;
};

export const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
         const data = await res.json();
         return data.data || data;
      }
    } catch (err) {
      console.warn("API fetchProducts failed, returning mock data");
    }
    // Mock fallback
    return PRODUCTS;
}
