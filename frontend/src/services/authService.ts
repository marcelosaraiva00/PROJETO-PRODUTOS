import api from './api';
import { LoginData, RegisterData, AuthResponse } from '../types/Auth';

export const authService = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<{ message: string }> => {
    const response = await api.post('/register', userData);
    return response.data;
  },
};
