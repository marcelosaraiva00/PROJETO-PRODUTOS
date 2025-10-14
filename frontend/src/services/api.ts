import axios from 'axios';
import { Produto, NovoProduto } from '../types/Produto';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor para adicionar o token JWT a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Interceptor de requisição - Token do localStorage:', token);
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

export const produtoService = {
  // Listar todos os produtos
  listar: async (): Promise<Produto[]> => {
    const response = await api.get('/produtos');
    return response.data;
  },

  // Buscar produto por ID
  buscar: async (id: string): Promise<Produto> => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  // Cadastrar novo produto
  cadastrar: async (produto: NovoProduto): Promise<Produto> => {
    const formData = new FormData();
    formData.append('nome', produto.nome);
    formData.append('precoCompra', produto.precoCompra.toString());
    formData.append('quantidadeComprada', produto.quantidadeComprada.toString());
    
    if (produto.imagem) {
      formData.append('imagem', produto.imagem);
    }

    const response = await api.post('/produtos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Atualizar produto
  atualizar: async (id: string, produto: Partial<NovoProduto>): Promise<Produto> => {
    const formData = new FormData();
    
    if (produto.nome) formData.append('nome', produto.nome);
    if (produto.precoCompra) formData.append('precoCompra', produto.precoCompra.toString());
    if (produto.quantidadeComprada) formData.append('quantidadeComprada', produto.quantidadeComprada.toString());
    if (produto.imagem) formData.append('imagem', produto.imagem);

    const response = await api.put(`/produtos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Deletar produto
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },
};

export default api;
