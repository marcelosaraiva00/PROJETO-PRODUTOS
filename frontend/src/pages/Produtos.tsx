import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { Produto, NovoProduto } from '../types/Produto';
import { produtoService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import ProdutoCard from '../components/ProdutoCard';
import ProdutoForm from '../components/ProdutoForm';

const Produtos: React.FC = () => {
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstoque, setFilterEstoque] = useState<'todos' | 'alto' | 'medio' | 'baixo'>('todos');
  
  const { produtos, isLoading, carregarProdutos } = useAppContext();

  useEffect(() => {
    filtrarProdutos();
  }, [produtos, searchTerm, filterEstoque]);

  const filtrarProdutos = useCallback(() => {
    let filtered = produtos;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter((produto: Produto) =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estoque
    if (filterEstoque !== 'todos') {
      filtered = filtered.filter((produto: Produto) => {
        const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
        switch (filterEstoque) {
          case 'alto':
            return porcentagem > 50;
          case 'medio':
            return porcentagem > 20 && porcentagem <= 50;
          case 'baixo':
            return porcentagem <= 20;
          default:
            return true;
        }
      });
    }

    setFilteredProdutos(filtered);
  }, [produtos, searchTerm, filterEstoque]);

  const handleCadastrar = async (novoProduto: NovoProduto) => {
    try {
      await produtoService.cadastrar(novoProduto);
      await carregarProdutos();
      setIsFormOpen(false);
      alert('Produto cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto. Tente novamente.');
    }
  };

  const handleEditar = async (produtoAtualizado: Partial<NovoProduto>) => {
    if (!editingProduto) return;

    try {
      await produtoService.atualizar(editingProduto.id, produtoAtualizado);
      await carregarProdutos();
      setEditingProduto(null);
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await produtoService.deletar(id);
      await carregarProdutos();
      alert('Produto deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao deletar produto. Tente novamente.');
    }
  };

  const abrirFormEdicao = (produto: Produto) => {
    setEditingProduto(produto);
    setIsFormOpen(true);
  };

  const fecharForm = () => {
    setIsFormOpen(false);
    setEditingProduto(null);
  };

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie todos os seus produtos</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterEstoque}
                onChange={(e) => setFilterEstoque(e.target.value as any)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white w-full md:w-48"
              >
                <option value="todos">Todos os estoques</option>
                <option value="alto">Estoque Alto</option>
                <option value="medio">Estoque Médio</option>
                <option value="baixo">Estoque Baixo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      {isLoading && produtos.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando produtos...</span>
        </div>
      ) : filteredProdutos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-400 mb-4">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterEstoque !== 'todos' ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterEstoque !== 'todos' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece cadastrando seu primeiro produto.'
            }
          </p>
          {(!searchTerm && filterEstoque === 'todos') && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Produto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProdutos.map((produto: Produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onEdit={abrirFormEdicao}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Formulário */}
      <ProdutoForm
        produto={editingProduto}
        isOpen={isFormOpen}
        onClose={fecharForm}
        onSubmit={editingProduto ? handleEditar : handleCadastrar}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Produtos;
