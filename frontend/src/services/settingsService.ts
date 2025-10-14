import api from './api';

interface SettingsResponse {
  profitMargin: number;
}

interface UpdateProfitMarginRequest {
  newProfitMargin: number;
}

interface UpdateProfitMarginResponse {
  message: string;
  profitMargin: number;
}

export const settingsService = {
  getProfitMargin: async (): Promise<SettingsResponse> => {
    const response = await api.get('/settings/profit-margin');
    return response.data;
  },

  updateProfitMargin: async (data: UpdateProfitMarginRequest): Promise<UpdateProfitMarginResponse> => {
    const response = await api.put('/settings/profit-margin', data);
    return response.data;
  },
};
