import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Produto } from '../types/Produto';
import { VendaComProduto } from '../types/Venda';
import { produtoService } from '../services/api';
import { vendaService } from '../services/vendaService';
import { useSettings } from './SettingsContext';

interface AppContextType {
  produtos: Produto[];
  vendas: VendaComProduto[];
  isLoading: boolean;
  carregarProdutos: () => Promise<void>;
  carregarVendas: () => Promise<void>;
  atualizarEstoque: (produtoId: string, quantidadeVendida: number) => void;
  adicionarVenda: (venda: VendaComProduto) => void;
  removerVenda: (vendaId: string) => void;
  estatisticasVendas: {
    vendasHoje: number;
    valorTotalHoje: number;
    produtosVendidosHoje: number;
    ticketMedio: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<VendaComProduto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { settings, loadSettings } = useSettings();

  // Carregar produtos
  const carregarProdutos = useCallback(async () => {
    try {
      setIsLoading(true);
      const produtosData = await produtoService.listar();
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
  }, [settings.profitMargin]); // Depende da margem de lucro para recalcular

  // Carregar vendas
  const carregarVendas = useCallback(async () => {
    try {
      const vendasData = await vendaService.listar();
      // Ordenar por data mais recente primeiro
      const vendasOrdenadas = vendasData.sort((a, b) => 
        new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime()
      );
      setVendas(vendasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  }, []);

  // Atualizar estoque após venda
  const atualizarEstoque = useCallback((produtoId: string, quantidadeVendida: number) => {
    setProdutos(prev => prev.map(produto => 
      produto.id === produtoId 
        ? { ...produto, quantidadeDisponivel: produto.quantidadeDisponivel - quantidadeVendida }
        : produto
    ));
  }, []);

  // Adicionar nova venda
  const adicionarVenda = useCallback((venda: VendaComProduto) => {
    setVendas(prev => [venda, ...prev]);
  }, []);

  // Remover venda (cancelamento)
  const removerVenda = useCallback((vendaId: string) => {
    setVendas(prev => prev.filter(venda => venda.id !== vendaId));
  }, []);

  // Calcular estatísticas de vendas
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

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
