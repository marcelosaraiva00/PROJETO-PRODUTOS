import { Venda, NovaVenda, VendaComProduto } from '../types/Venda';
import api from './api';

export const vendaService = {
  // Listar todas as vendas
  listar: async (): Promise<VendaComProduto[]> => {
    const response = await api.get('/vendas');
    return response.data;
  },

  // Buscar venda por ID
  buscarPorId: async (id: string): Promise<VendaComProduto> => {
    const response = await api.get(`/vendas/${id}`);
    return response.data;
  },

  // Registrar nova venda
  registrar: async (novaVenda: NovaVenda): Promise<Venda> => {
    const response = await api.post('/vendas', novaVenda);
    return response.data;
  },

  // Cancelar venda (reestocar produto)
  cancelar: async (id: string): Promise<void> => {
    await api.delete(`/vendas/${id}`);
  },
};
