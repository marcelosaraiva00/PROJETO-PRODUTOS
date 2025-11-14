/**
 * SERVIÇO PRINCIPAL DE API
 * 
 * Este arquivo configura o cliente HTTP Axios e fornece serviços para
 * operações CRUD de produtos. Inclui interceptor para autenticação automática.
 */

import axios from 'axios';
import { Produto, NovoProduto } from '../types/Produto';

/**
 * Configuração do cliente Axios para comunicação com o backend
 * Define URL base e configurações padrão
 * Em produção, usa a variável de ambiente REACT_APP_API_URL
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // URL base da API
});

/**
 * Interceptor de requisição para adicionar token JWT automaticamente
 * Adiciona o token de autenticação em todas as requisições autenticadas
 */
api.interceptors.request.use(
  (config) => {
    // Obter token do localStorage
    const token = localStorage.getItem('token');
    console.log('Interceptor de requisição - Token do localStorage:', token);
    
    // Adicionar token ao cabeçalho Authorization se existir
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Interceptor de requisição - Token adicionado ao cabeçalho.');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Serviço para operações CRUD de produtos
 * Fornece métodos para listar, buscar, criar, atualizar e deletar produtos
 */
export const produtoService = {
  /**
   * Listar todos os produtos do usuário autenticado
   * @returns Promise<Produto[]> - Lista de produtos
   */
  listar: async (): Promise<Produto[]> => {
    const response = await api.get('/produtos');
    return response.data;
  },

  /**
   * Buscar produto específico por ID
   * @param id - ID do produto
   * @returns Promise<Produto> - Dados do produto
   */
  buscar: async (id: string): Promise<Produto> => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  /**
   * Cadastrar novo produto
   * Envia dados como FormData para suportar upload de imagem
   * @param produto - Dados do novo produto
   * @returns Promise<Produto> - Produto criado
   */
  cadastrar: async (produto: NovoProduto): Promise<Produto> => {
    const formData = new FormData();
    formData.append('nome', produto.nome);
    if (produto.fornecedor !== undefined) {
      formData.append('fornecedor', produto.fornecedor);
    }
    formData.append('precoCompra', produto.precoCompra.toString());
    formData.append('quantidadeComprada', produto.quantidadeComprada.toString());
    
    // Adicionar imagem se fornecida
    if (produto.imagem) {
      formData.append('imagem', produto.imagem);
    }

    const response = await api.post('/produtos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Necessário para upload de arquivos
      },
    });
    return response.data;
  },

  /**
   * Atualizar produto existente
   * Permite atualização parcial dos dados do produto
   * @param id - ID do produto
   * @param produto - Dados parciais para atualização
   * @returns Promise<Produto> - Produto atualizado
   */
  atualizar: async (id: string, produto: Partial<NovoProduto>): Promise<Produto> => {
    const formData = new FormData();
    
    // Adicionar apenas campos fornecidos
    if (produto.nome) formData.append('nome', produto.nome);
    if (produto.fornecedor !== undefined) formData.append('fornecedor', produto.fornecedor);
    if (produto.precoCompra) formData.append('precoCompra', produto.precoCompra.toString());
    if (produto.quantidadeComprada) formData.append('quantidadeComprada', produto.quantidadeComprada.toString());
    if (produto.imagem) formData.append('imagem', produto.imagem);

    const response = await api.put(`/produtos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Necessário para upload de arquivos
      },
    });
    return response.data;
  },

  /**
   * Deletar produto
   * Remove produto do sistema e arquivo de imagem associado
   * @param id - ID do produto
   * @returns Promise<void>
   */
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },
};

// Exportar instância do Axios para uso em outros serviços
export default api;
