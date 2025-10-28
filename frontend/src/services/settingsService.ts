/**
 * SERVIÇO DE CONFIGURAÇÕES
 * 
 * Fornece métodos para gerenciar configurações globais da aplicação,
 * incluindo margem de lucro configurável.
 */

import api from './api';

/**
 * Interface para resposta de configurações
 */
interface SettingsResponse {
  profitMargin: number; // Margem de lucro atual
}

/**
 * Interface para requisição de atualização de margem
 */
interface UpdateProfitMarginRequest {
  newProfitMargin: number; // Nova margem de lucro
}

/**
 * Interface para resposta de atualização de margem
 */
interface UpdateProfitMarginResponse {
  message: string;      // Mensagem de confirmação
  profitMargin: number; // Margem de lucro atualizada
}

/**
 * Serviço para operações de configurações
 */
export const settingsService = {
  /**
   * Obter margem de lucro atual
   * @returns Promise<SettingsResponse> - Margem de lucro atual
   */
  getProfitMargin: async (): Promise<SettingsResponse> => {
    const response = await api.get('/settings/profit-margin');
    return response.data;
  },

  /**
   * Atualizar margem de lucro
   * @param data - Nova margem de lucro
   * @returns Promise<UpdateProfitMarginResponse> - Confirmação e margem atualizada
   */
  updateProfitMargin: async (data: UpdateProfitMarginRequest): Promise<UpdateProfitMarginResponse> => {
    const response = await api.put('/settings/profit-margin', data);
    return response.data;
  },
};
