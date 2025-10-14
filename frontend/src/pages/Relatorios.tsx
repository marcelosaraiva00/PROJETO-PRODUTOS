import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Package,
  Download,
  Calendar
} from 'lucide-react';
import { Produto } from '../types/Produto';
import { produtoService } from '../services/api';

const Relatorios: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todos' | 'mes' | 'semana'>('todos');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const data = await produtoService.listar();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProdutosFiltrados = () => {
    const agora = new Date();
    let dataLimite: Date;

    switch (filtroPeriodo) {
      case 'semana':
        dataLimite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        dataLimite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return produtos;
    }

    return produtos.filter(produto => 
      new Date(produto.dataCadastro) >= dataLimite
    );
  };

  const getEstatisticasRelatorio = () => {
    const produtosFiltrados = getProdutosFiltrados();
    
    const totalProdutos = produtosFiltrados.length;
    const valorTotalEstoque = produtosFiltrados.reduce((total, produto) => 
      total + (produto.precoCompra * produto.quantidadeDisponivel), 0
    );
    const valorPotencialVendas = produtosFiltrados.reduce((total, produto) => 
      total + (produto.precoSugeridoVenda * produto.quantidadeDisponivel), 0
    );
    const margemTotal = valorPotencialVendas - valorTotalEstoque;
    const margemPercentual = valorTotalEstoque > 0 ? (margemTotal / valorTotalEstoque) * 100 : 0;

    // Produtos com melhor margem
    const produtosComMargem = produtosFiltrados.map(produto => ({
      ...produto,
      margem: produto.precoSugeridoVenda - produto.precoCompra,
      margemPercentual: ((produto.precoSugeridoVenda / produto.precoCompra) - 1) * 100
    })).sort((a, b) => b.margemPercentual - a.margemPercentual);

    // Produtos com estoque baixo
    const produtosEstoqueBaixo = produtosFiltrados.filter(produto => {
      const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
      return porcentagem <= 20;
    });

    return {
      totalProdutos,
      valorTotalEstoque,
      valorPotencialVendas,
      margemTotal,
      margemPercentual,
      produtosComMargem: produtosComMargem.slice(0, 5),
      produtosEstoqueBaixo,
      produtosFiltrados
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };


  const estatisticas = getEstatisticasRelatorio();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando relatórios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e insights sobre seus produtos</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos os períodos</option>
              <option value="semana">Última semana</option>
              <option value="mes">Último mês</option>
            </select>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-3xl font-bold text-gray-900">{estatisticas.totalProdutos}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {filtroPeriodo === 'todos' ? 'Todos os produtos' : 
               filtroPeriodo === 'semana' ? 'Última semana' : 'Último mês'}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor em Estoque</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(estatisticas.valorTotalEstoque)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Investimento total
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Potencial</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(estatisticas.valorPotencialVendas)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Receita potencial
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Margem Total</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(estatisticas.margemTotal)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500 mr-2">Margem:</span>
            <span className="text-sm font-medium text-green-600">
              {estatisticas.margemPercentual.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos com melhor margem */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Produtos por Margem</h2>
            <p className="text-sm text-gray-600">Produtos com melhor rentabilidade</p>
          </div>
          <div className="p-6">
            {estatisticas.produtosComMargem.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum produto encontrado no período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {estatisticas.produtosComMargem.map((produto, index) => (
                  <div key={produto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{produto.nome}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(produto.precoCompra)} → {formatCurrency(produto.precoSugeridoVenda)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +{produto.margemPercentual.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(produto.margem)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Produtos com estoque baixo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Alerta de Estoque</h2>
            <p className="text-sm text-gray-600">Produtos que precisam de reposição</p>
          </div>
          <div className="p-6">
            {estatisticas.produtosEstoqueBaixo.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 font-medium">Todos os produtos com estoque adequado!</p>
                <p className="text-gray-500 text-sm">Continue assim!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {estatisticas.produtosEstoqueBaixo.map((produto) => {
                  const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
                  return (
                    <div key={produto.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{produto.nome}</p>
                          <p className="text-sm text-red-600">
                            {porcentagem.toFixed(1)}% restante
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          {produto.quantidadeDisponivel}/{produto.quantidadeComprada}
                        </p>
                        <p className="text-sm text-gray-500">unidades</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo do período */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {estatisticas.totalProdutos}
            </div>
            <div className="text-sm text-gray-600">
              {filtroPeriodo === 'todos' ? 'Total de produtos' : 
               filtroPeriodo === 'semana' ? 'Produtos na última semana' : 'Produtos no último mês'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(estatisticas.margemTotal)}
            </div>
            <div className="text-sm text-gray-600">Lucro potencial total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {estatisticas.margemPercentual.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Margem média</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
