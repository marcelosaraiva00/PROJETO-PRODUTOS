/**
 * COMPONENTE PRODUTO CARD
 * 
 * Card para exibir informações de um produto de forma visual.
 * Inclui imagem, preços, estoque, status e botões de ação.
 */

import React from 'react';
import { Package, Edit, Trash2, DollarSign, Building2 } from 'lucide-react';
import { Produto } from '../types/Produto';

/**
 * Props do componente ProdutoCard
 */
interface ProdutoCardProps {
  produto: Produto;                    // Dados do produto
  onEdit: (produto: Produto) => void;  // Função para editar produto
  onDelete: (id: string) => void;     // Função para deletar produto
}

/**
 * Componente ProdutoCard - Exibe informações de um produto
 */
const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onEdit, onDelete }) => {
  /**
   * Formatar valor monetário em Real brasileiro
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  /**
   * Formatar data em formato brasileiro
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  /**
   * Determinar status do estoque baseado na porcentagem disponível
   */
  const getEstoqueStatus = () => {
    const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
    if (porcentagem > 50) return { text: 'Estoque Alto', color: 'text-green-600' };
    if (porcentagem > 20) return { text: 'Estoque Médio', color: 'text-yellow-600' };
    return { text: 'Estoque Baixo', color: 'text-red-600' };
  };

  const estoqueStatus = getEstoqueStatus();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Cabeçalho do card com nome e botões de ação */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {produto.nome}
            </h3>
            {produto.fornecedor && (
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Building2 className="h-4 w-4 mr-1" />
                Fornecedor: {produto.fornecedor}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Package className="h-4 w-4 mr-1" />
              Cadastrado em: {formatDate(produto.dataCadastro)}
            </div>
          </div>
          <div className="flex space-x-2">
            {/* Botão de editar */}
            <button
              onClick={() => onEdit(produto)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
              title="Editar produto"
            >
              <Edit className="h-4 w-4" />
            </button>
            {/* Botão de deletar */}
            <button
              onClick={() => onDelete(produto.id)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
              title="Deletar produto"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Imagem do produto (se existir) */}
        {produto.imagem && (
          <div className="mb-4">
            <img
              src={`/uploads/${produto.imagem}`}
              alt={produto.nome}
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Grid de informações de preços */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Preço de Compra</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(produto.precoCompra)}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Preço Sugerido</div>
            <div className="text-lg font-semibold text-green-700 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {formatCurrency(produto.precoSugeridoVenda)}
            </div>
          </div>
        </div>

        {/* Grid de informações de quantidade */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Quantidade Comprada</div>
            <div className="text-lg font-semibold text-blue-700">
              {produto.quantidadeComprada}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Disponível</div>
            <div className="text-lg font-semibold text-purple-700">
              {produto.quantidadeDisponivel}
            </div>
          </div>
        </div>

        {/* Rodapé com status do estoque e margem */}
        <div className="flex items-center justify-between">
          <div className={`text-sm font-medium ${estoqueStatus.color}`}>
            {estoqueStatus.text}
          </div>
          <div className="text-xs text-gray-500">
            Margem: {((produto.precoSugeridoVenda / produto.precoCompra - 1) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoCard;
