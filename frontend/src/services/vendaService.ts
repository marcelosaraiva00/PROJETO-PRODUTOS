/**
 * SERVIÇO DE VENDAS
 * 
 * Fornece métodos para operações CRUD de vendas, incluindo
 * listagem, busca, registro e cancelamento de vendas.
 */

import { Venda, NovaVenda, VendaComProduto } from '../types/Venda';
import api from './api';

/**
 * Serviço para operações de vendas
 */
export const vendaService = {
  /**
   * Listar todas as vendas do usuário autenticado
   * @returns Promise<VendaComProduto[]> - Lista de vendas com dados do produto
   */
  listar: async (): Promise<VendaComProduto[]> => {
    const response = await api.get('/vendas');
    return response.data;
  },

  /**
   * Buscar venda específica por ID
   * @param id - ID da venda
   * @returns Promise<VendaComProduto> - Dados da venda com produto
   */
  buscarPorId: async (id: string): Promise<VendaComProduto> => {
    const response = await api.get(`/vendas/${id}`);
    return response.data;
  },

  /**
   * Registrar nova venda
   * Atualiza automaticamente o estoque do produto
   * @param novaVenda - Dados da nova venda
   * @returns Promise<Venda> - Venda registrada
   */
  registrar: async (novaVenda: NovaVenda): Promise<Venda> => {
    const response = await api.post('/vendas', novaVenda);
    return response.data;
  },

  /**
   * Cancelar venda
   * Remove a venda e reestoca o produto automaticamente
   * @param id - ID da venda a ser cancelada
   * @returns Promise<void>
   */
  cancelar: async (id: string): Promise<void> => {
    await api.delete(`/vendas/${id}`);
  },
};
