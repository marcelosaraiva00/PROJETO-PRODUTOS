import React, { useState, useEffect } from 'react';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  TrendingDown,
  Activity
} from 'lucide-react';
import { Produto } from '../types/Produto';
import { produtoService } from '../services/api';

const Dashboard: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getEstatisticas = () => {
    const totalProdutos = produtos.length;
    const valorTotalEstoque = produtos.reduce((total, produto) => 
      total + (produto.precoCompra * produto.quantidadeDisponivel), 0
    );
    const valorTotalVendas = produtos.reduce((total, produto) => 
      total + (produto.precoSugeridoVenda * produto.quantidadeDisponivel), 0
    );
    const produtosEstoqueBaixo = produtos.filter(produto => {
      const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
      return porcentagem <= 20;
    }).length;
    const margemMedia = produtos.length > 0 
      ? produtos.reduce((total, produto) => 
          total + ((produto.precoSugeridoVenda / produto.precoCompra - 1) * 100), 0
        ) / produtos.length 
      : 0;

    return { 
      totalProdutos, 
      valorTotalEstoque, 
      valorTotalVendas, 
      produtosEstoqueBaixo, 
      margemMedia 
    };
  };

  const getProdutosRecentes = () => {
    return produtos
      .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime())
      .slice(0, 5);
  };

  const getProdutosEstoqueBaixo = () => {
    return produtos.filter(produto => {
      const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
      return porcentagem <= 20;
    });
  };

  const estatisticas = getEstatisticas();
  const produtosRecentes = getProdutosRecentes();
  const produtosEstoqueBaixo = getProdutosEstoqueBaixo();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu sistema de produtos</p>
        </div>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Cards de estatísticas */}
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
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor em Estoque</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(estatisticas.valorTotalEstoque)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Potencial</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(estatisticas.valorTotalVendas)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="h-4 w-4 text-purple-500 mr-1" />
            <span className="text-purple-600 font-medium">Margem: {estatisticas.margemMedia.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-3xl font-bold text-gray-900">{estatisticas.produtosEstoqueBaixo}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600 font-medium">Atenção necessária</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Produtos Recentes</h2>
            <p className="text-sm text-gray-600">Últimos produtos cadastrados</p>
          </div>
          <div className="p-6">
            {produtosRecentes.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum produto cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {produtosRecentes.map((produto) => (
                  <div key={produto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {produto.imagem ? (
                        <img
                          src={`/uploads/${produto.imagem}`}
                          alt={produto.nome}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{produto.nome}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(produto.dataCadastro).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(produto.precoSugeridoVenda)}
                      </p>
                      <p className="text-sm text-gray-500">Estoque: {produto.quantidadeDisponivel}</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Estoque Baixo</h2>
            <p className="text-sm text-gray-600">Produtos que precisam de reposição</p>
          </div>
          <div className="p-6">
            {produtosEstoqueBaixo.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 font-medium">Todos os produtos com estoque adequado!</p>
                <p className="text-gray-500 text-sm">Continue assim!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {produtosEstoqueBaixo.map((produto) => {
                  const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
                  return (
                    <div key={produto.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        {produto.imagem ? (
                          <img
                            src={`/uploads/${produto.imagem}`}
                            alt={produto.nome}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-red-600" />
                          </div>
                        )}
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
    </div>
  );
};

export default Dashboard;
