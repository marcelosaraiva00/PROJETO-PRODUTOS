/**
 * SERVIÇO DE AUTENTICAÇÃO
 * 
 * Fornece métodos para autenticação de usuários, incluindo
 * login e registro de novas contas.
 */

import api from './api';
import { LoginData, RegisterData, AuthResponse } from '../types/Auth';

/**
 * Serviço para operações de autenticação
 */
export const authService = {
  /**
   * Realizar login do usuário
   * @param credentials - Dados de login (username e password)
   * @returns Promise<AuthResponse> - Token e dados do usuário
   */
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  /**
   * Registrar novo usuário
   * @param userData - Dados de registro (username e password)
   * @returns Promise<{ message: string }> - Mensagem de confirmação
   */
  register: async (userData: RegisterData): Promise<{ message: string }> => {
    const response = await api.post('/register', userData);
    return response.data;
  },
};
