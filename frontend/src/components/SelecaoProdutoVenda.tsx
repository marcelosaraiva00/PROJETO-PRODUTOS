import React, { useState, useEffect } from 'react';
import { Search, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { Produto } from '../types/Produto';
import { useAppContext } from '../context/AppContext';

interface SelecaoProdutoVendaProps {
  onProdutoSelecionado: (produto: Produto) => void;
}

const SelecaoProdutoVenda: React.FC<SelecaoProdutoVendaProps> = ({ onProdutoSelecionado }) => {
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { produtos, isLoading } = useAppContext();

  useEffect(() => {
    filtrarProdutos();
  }, [produtos, searchTerm]);

  const filtrarProdutos = () => {
    // Filtrar apenas produtos com estoque disponível
    let filtered = produtos.filter(p => p.quantidadeDisponivel > 0);

    if (searchTerm) {
      filtered = filtered.filter(produto =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setProdutosFiltrados(filtered);
  };

  const getStatusEstoque = (produto: Produto) => {
    const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
    if (porcentagem <= 20) return { texto: 'Estoque Baixo', cor: 'text-red-600 bg-red-50' };
    if (porcentagem <= 50) return { texto: 'Estoque Médio', cor: 'text-yellow-600 bg-yellow-50' };
    return { texto: 'Estoque Alto', cor: 'text-green-600 bg-green-50' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando produtos...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
          Selecionar Produto para Venda
        </h2>
        <div className="text-sm text-gray-500">
          {produtosFiltrados.length} produto(s) disponível(is)
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar produto por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Lista de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtosFiltrados.map((produto) => {
          const statusEstoque = getStatusEstoque(produto);
          
          return (
            <div
              key={produto.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onProdutoSelecionado(produto)}
            >
              {/* Imagem do produto */}
              <div className="w-full h-32 mb-3 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {produto.imagem ? (
                  <img
                    src={`http://localhost:5000/uploads/${produto.imagem}`}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Informações do produto */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 truncate">{produto.nome}</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-1" />
                    {produto.quantidadeDisponivel} disponível(is)
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusEstoque.cor}`}>
                    {statusEstoque.texto}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-medium text-green-600">
                      R$ {produto.precoSugeridoVenda.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Selecionar para Venda
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {produtosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm ? 'Nenhum produto encontrado para a busca.' : 'Nenhum produto com estoque disponível.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SelecaoProdutoVenda;
