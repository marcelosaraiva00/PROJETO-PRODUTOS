import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Calendar, 
  Package, 
  DollarSign, 
  Search, 
  RefreshCw
} from 'lucide-react';
import { VendaComProduto } from '../types/Venda';
import { vendaService } from '../services/vendaService';
import { useAppContext } from '../context/AppContext';

const HistoricoVendas: React.FC = () => {
  const [vendasFiltradas, setVendasFiltradas] = useState<VendaComProduto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroData, setFiltroData] = useState('');
  
  const { vendas, isLoading, carregarVendas, removerVenda } = useAppContext();

  useEffect(() => {
    filtrarVendas();
  }, [vendas, searchTerm, filtroData]);

  const filtrarVendas = () => {
    let filtered = vendas;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(venda =>
        venda.produtoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venda.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por data
    if (filtroData) {
      filtered = filtered.filter(venda => {
        const vendaDate = new Date(venda.dataVenda).toISOString().split('T')[0];
        return vendaDate === filtroData;
      });
    }

    setVendasFiltradas(filtered);
  };

  const cancelarVenda = async (vendaId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta venda? O produto será reestocado.')) {
      return;
    }

    try {
      await vendaService.cancelar(vendaId);
      removerVenda(vendaId);
      await carregarVendas();
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      alert('Erro ao cancelar venda. Tente novamente.');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTotalVendas = () => {
    return vendasFiltradas.reduce((total, venda) => total + venda.valorTotal, 0);
  };

  const calcularQuantidadeTotal = () => {
    return vendasFiltradas.reduce((total, venda) => total + venda.quantidadeVendida, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando histórico de vendas...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Package className="h-5 w-5 mr-2 text-blue-600" />
          Histórico de Vendas
        </h2>
        <button
          onClick={carregarVendas}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Busca por produto */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por data */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Estatísticas rápidas */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium text-green-600">
                R$ {calcularTotalVendas().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Itens:</span>
              <span className="font-medium">{calcularQuantidadeTotal()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de vendas */}
      <div className="space-y-4">
        {vendasFiltradas.map((venda) => (
          <div
            key={venda.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {/* Imagem do produto */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {venda.produto?.imagem ? (
                      <img
                        src={`http://localhost:5000/uploads/${venda.produto.imagem}`}
                        alt={venda.produtoNome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {/* Informações da venda */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{venda.produtoNome}</h3>
                    <p className="text-sm text-gray-600">
                      {venda.quantidadeVendida} unidade(s) × R$ {venda.precoVenda.toFixed(2)}
                    </p>
                    {venda.observacoes && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Obs:</span> {venda.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatarData(venda.dataVenda)}
                  </div>
                  <div className="font-medium text-green-600">
                    R$ {venda.valorTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Botão de cancelar */}
              <button
                onClick={() => cancelarVenda(venda.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancelar venda (reestocar produto)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vazio */}
      {vendasFiltradas.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm || filtroData ? 'Nenhuma venda encontrada para os filtros aplicados.' : 'Nenhuma venda registrada ainda.'}
          </p>
        </div>
      )}

      {/* Resumo total */}
      {vendasFiltradas.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">Total das Vendas</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  R$ {calcularTotalVendas().toFixed(2)}
                </div>
                <div className="text-sm text-green-700">
                  {calcularQuantidadeTotal()} item(s) vendido(s)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoVendas;
