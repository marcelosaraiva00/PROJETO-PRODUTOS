/**
 * SERVIÇO DE ADMINISTRAÇÃO
 * 
 * Fornece métodos para operações administrativas,
 * incluindo aprovação e gerenciamento de usuários.
 */

import api from './api';
import { PendingUser } from '../types/Auth';

/**
 * Serviço para operações administrativas
 */
export const adminService = {
  /**
   * Listar usuários aguardando aprovação
   * @returns Promise<PendingUser[]> - Lista de usuários pendentes
   */
  getPendingUsers: async (): Promise<PendingUser[]> => {
    const response = await api.get('/admin/users/pending');
    return response.data;
  },

  /**
   * Aprovar usuário
   * @param userId - ID do usuário a ser aprovado
   * @returns Promise<{ message: string; user: any }> - Resposta da aprovação
   */
  approveUser: async (userId: string): Promise<{ message: string; user: any }> => {
    const response = await api.post(`/admin/users/${userId}/approve`);
    return response.data;
  },

  /**
   * Rejeitar usuário
   * @param userId - ID do usuário a ser rejeitado
   * @returns Promise<{ message: string; user: any }> - Resposta da rejeição
   */
  rejectUser: async (userId: string): Promise<{ message: string; user: any }> => {
    const response = await api.post(`/admin/users/${userId}/reject`);
    return response.data;
  },

  /**
   * Listar todos os usuários (apenas administradores)
   * @returns Promise<any[]> - Lista completa de usuários
   */
  getAllUsers: async (): Promise<any[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },
};
