import React, { useState } from 'react';
import { ShoppingCart, Package, TrendingUp, DollarSign } from 'lucide-react';
import { Produto } from '../types/Produto';
import { NovaVenda } from '../types/Venda';
import { vendaService } from '../services/vendaService';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import SelecaoProdutoVenda from '../components/SelecaoProdutoVenda';
import FormularioVenda from '../components/FormularioVenda';
import HistoricoVendas from '../components/HistoricoVendas';

const Vendas: React.FC = () => {
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'vender' | 'historico'>('vender');
  
  const { estatisticasVendas, atualizarEstoque, adicionarVenda, carregarProdutos } = useAppContext();
  const { showNotification } = useNotification();

  const handleProdutoSelecionado = (produto: Produto) => {
    setProdutoSelecionado(produto);
  };

  const handleCancelarVenda = () => {
    setProdutoSelecionado(null);
  };

  const handleConfirmarVenda = async (venda: NovaVenda) => {
    try {
      setIsLoading(true);
      const vendaRegistrada = await vendaService.registrar(venda);
      
      // Atualizar estoque no contexto
      atualizarEstoque(venda.produtoId, venda.quantidadeVendida);
      
      // Buscar a venda completa para adicionar ao contexto
      const vendaCompleta = await vendaService.buscarPorId(vendaRegistrada.id);
      adicionarVenda(vendaCompleta);
      
      // Recarregar produtos para garantir sincronização
      await carregarProdutos();
      
      setProdutoSelecionado(null);
      
      // Mostrar notificação de sucesso
      showNotification({
        type: 'success',
        title: 'Venda registrada com sucesso!',
        message: `${venda.quantidadeVendida} unidade(s) vendida(s) por R$ ${(venda.quantidadeVendida * venda.precoVenda).toFixed(2)}`,
        duration: 4000
      });
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      showNotification({
        type: 'error',
        title: 'Erro ao registrar venda',
        message: 'Tente novamente ou verifique se há estoque disponível.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const estatisticas = [
    {
      titulo: 'Vendas Hoje',
      valor: `R$ ${estatisticasVendas.valorTotalHoje.toFixed(2)}`,
      icone: DollarSign,
      cor: 'text-green-600 bg-green-50',
      descricao: 'Receita do dia'
    },
    {
      titulo: 'Produtos Vendidos',
      valor: estatisticasVendas.produtosVendidosHoje.toString(),
      icone: Package,
      cor: 'text-blue-600 bg-blue-50',
      descricao: 'Itens vendidos hoje'
    },
    {
      titulo: 'Ticket Médio',
      valor: `R$ ${estatisticasVendas.ticketMedio.toFixed(2)}`,
      icone: TrendingUp,
      cor: 'text-purple-600 bg-purple-50',
      descricao: 'Valor médio por venda'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="h-6 w-6 mr-3 text-blue-600" />
            Vendas
          </h1>
          <p className="text-gray-600 mt-1">
            Registre vendas e gerencie o estoque dos seus produtos
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {estatisticas.map((stat, index) => {
          const IconComponent = stat.icone;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.valor}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.descricao}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.cor}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Abas */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setAbaAtiva('vender')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                abaAtiva === 'vender'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              Nova Venda
            </button>
            <button
              onClick={() => setAbaAtiva('historico')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                abaAtiva === 'historico'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Histórico de Vendas
            </button>
          </nav>
        </div>

        {/* Conteúdo das abas */}
        <div className="p-6">
          {abaAtiva === 'vender' && (
            <SelecaoProdutoVenda onProdutoSelecionado={handleProdutoSelecionado} />
          )}
          
          {abaAtiva === 'historico' && <HistoricoVendas />}
        </div>
      </div>

      {/* Modal de formulário de venda */}
      {produtoSelecionado && (
        <FormularioVenda
          produto={produtoSelecionado}
          onCancelar={handleCancelarVenda}
          onConfirmar={handleConfirmarVenda}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Vendas;
