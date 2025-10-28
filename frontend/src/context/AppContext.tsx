/**
 * CONTEXTO PRINCIPAL DA APLICAÇÃO
 * 
 * Este contexto gerencia o estado global da aplicação, incluindo:
 * - Lista de produtos e vendas
 * - Operações CRUD para produtos e vendas
 * - Cálculo de estatísticas de vendas
 * - Sincronização com o backend
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Produto } from '../types/Produto';
import { VendaComProduto } from '../types/Venda';
import { produtoService } from '../services/api';
import { vendaService } from '../services/vendaService';
import { useSettings } from './SettingsContext';

/**
 * Interface que define o tipo do contexto principal da aplicação
 */
interface AppContextType {
  produtos: Produto[];                    // Lista de produtos do usuário
  vendas: VendaComProduto[];              // Lista de vendas do usuário
  isLoading: boolean;                     // Estado de carregamento
  carregarProdutos: () => Promise<void>;   // Função para carregar produtos do backend
  carregarVendas: () => Promise<void>;    // Função para carregar vendas do backend
  atualizarEstoque: (produtoId: string, quantidadeVendida: number) => void; // Atualizar estoque localmente
  adicionarVenda: (venda: VendaComProduto) => void; // Adicionar venda à lista local
  removerVenda: (vendaId: string) => void; // Remover venda da lista local
  estatisticasVendas: {                   // Estatísticas calculadas das vendas
    vendasHoje: number;                   // Número de vendas hoje
    valorTotalHoje: number;                // Valor total vendido hoje
    produtosVendidosHoje: number;          // Quantidade de produtos vendidos hoje
    ticketMedio: number;                  // Ticket médio das vendas de hoje
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto principal da aplicação
 * Gerencia estado global de produtos, vendas e estatísticas
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Estados do contexto
  const [produtos, setProdutos] = useState<Produto[]>([]);           // Lista de produtos
  const [vendas, setVendas] = useState<VendaComProduto[]>([]);     // Lista de vendas
  const [isLoading, setIsLoading] = useState(false);               // Estado de carregamento
  const { settings, loadSettings } = useSettings();                 // Contexto de configurações

  /**
   * Carregar produtos do backend
   * Atualiza preços sugeridos baseado na margem de lucro atual
   */
  const carregarProdutos = useCallback(async () => {
    try {
      setIsLoading(true);
      const produtosData = await produtoService.listar();
      
      // Recalcular preços sugeridos com a margem atual
      const produtosComPrecoSugeridoAtualizado = produtosData.map(p => ({
        ...p,
        precoSugeridoVenda: p.precoCompra * (1 + settings.profitMargin)
      }));
      
      setProdutos(produtosComPrecoSugeridoAtualizado);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [settings.profitMargin]);

  /**
   * Carregar vendas do backend
   * Ordena por data mais recente primeiro
   */
  const carregarVendas = useCallback(async () => {
    try {
      const vendasData = await vendaService.listar();
      
      // Ordenar vendas por data mais recente primeiro
      const vendasOrdenadas = vendasData.sort((a, b) => 
        new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime()
      );
      
      setVendas(vendasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  }, []);

  /**
   * Atualizar estoque de um produto após venda
   * Reduz a quantidade disponível localmente
   */
  const atualizarEstoque = useCallback((produtoId: string, quantidadeVendida: number) => {
    setProdutos(prev => prev.map(produto => 
      produto.id === produtoId 
        ? { ...produto, quantidadeDisponivel: produto.quantidadeDisponivel - quantidadeVendida }
        : produto
    ));
  }, []);

  /**
   * Adicionar nova venda à lista local
   * Adiciona no início da lista para manter ordem cronológica
   */
  const adicionarVenda = useCallback((venda: VendaComProduto) => {
    setVendas(prev => [venda, ...prev]);
  }, []);

  /**
   * Remover venda da lista local (cancelamento)
   * Filtra a venda pelo ID
   */
  const removerVenda = useCallback((vendaId: string) => {
    setVendas(prev => prev.filter(venda => venda.id !== vendaId));
  }, []);

  /**
   * Calcular estatísticas das vendas do dia atual
   * Usa useMemo para otimizar performance
   */
  const estatisticasVendas = React.useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const vendasHoje = vendas.filter(venda => 
      venda.dataVenda.startsWith(hoje)
    );

    const valorTotalHoje = vendasHoje.reduce((total, venda) => total + venda.valorTotal, 0);
    const produtosVendidosHoje = vendasHoje.reduce((total, venda) => total + venda.quantidadeVendida, 0);
    const ticketMedio = vendasHoje.length > 0 ? valorTotalHoje / vendasHoje.length : 0;

    return {
      vendasHoje: vendasHoje.length,
      valorTotalHoje,
      produtosVendidosHoje,
      ticketMedio
    };
  }, [vendas]);

  // Valor do contexto
  const value: AppContextType = {
    produtos,
    vendas,
    isLoading,
    carregarProdutos,
    carregarVendas,
    atualizarEstoque,
    adicionarVenda,
    removerVenda,
    estatisticasVendas
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook personalizado para usar o contexto principal da aplicação
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
