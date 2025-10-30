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

  /**
   * Bloquear usuário temporariamente
   * @param userId - ID do usuário a ser bloqueado
   * @param reason - Motivo do bloqueio
   * @returns Promise<{ message: string; user: any }> - Resposta do bloqueio
   */
  blockUser: async (userId: string, reason?: string): Promise<{ message: string; user: any }> => {
    const response = await api.post(`/admin/users/${userId}/block`, { reason });
    return response.data;
  },

  /**
   * Desbloquear usuário
   * @param userId - ID do usuário a ser desbloqueado
   * @returns Promise<{ message: string; user: any }> - Resposta do desbloqueio
   */
  unblockUser: async (userId: string): Promise<{ message: string; user: any }> => {
    const response = await api.post(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  /**
   * Deletar usuário permanentemente
   * @param userId - ID do usuário a ser deletado
   * @returns Promise<{ message: string; user: any }> - Resposta da deleção
   */
  deleteUser: async (userId: string): Promise<{ message: string; user: any }> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
