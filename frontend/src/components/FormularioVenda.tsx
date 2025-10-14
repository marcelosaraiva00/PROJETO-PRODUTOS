import React, { useState } from 'react';
import { X, Package, DollarSign, ShoppingCart, Save } from 'lucide-react';
import { Produto } from '../types/Produto';
import { NovaVenda } from '../types/Venda';
import { useSettings } from '../context/SettingsContext';
import { useNotification } from '../context/NotificationContext';

interface FormularioVendaProps {
  produto: Produto;
  onCancelar: () => void;
  onConfirmar: (venda: NovaVenda) => void;
  isLoading?: boolean;
}

const FormularioVenda: React.FC<FormularioVendaProps> = ({
  produto,
  onCancelar,
  onConfirmar,
  isLoading = false
}) => {
  const { settings } = useSettings();
  const { showNotification } = useNotification();
  const [quantidadeVendida, setQuantidadeVendida] = useState(1);
  // Calcular preço de venda inicial baseado na margem de lucro das configurações
  const [precoVenda, setPrecoVenda] = useState(produto.precoCompra * (1 + settings.profitMargin));
  const [observacoes, setObservacoes] = useState('');

  const valorTotal = quantidadeVendida * precoVenda;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do formulário de venda:', { quantidadeVendida, precoVenda, produtoDisponivel: produto.quantidadeDisponivel });
    
    if (quantidadeVendida > produto.quantidadeDisponivel) {
      showNotification({
        type: 'error',
        title: 'Erro na Venda',
        message: `Quantidade ${quantidadeVendida} maior que o estoque disponível (${produto.quantidadeDisponivel})!`
      });
      return;
    }

    if (quantidadeVendida <= 0) {
      showNotification({
        type: 'error',
        title: 'Erro na Venda',
        message: 'A quantidade deve ser maior que zero!'
      });
      return;
    }

    if (precoVenda <= 0) {
      showNotification({
        type: 'error',
        title: 'Erro na Venda',
        message: 'O preço de venda deve ser maior que zero!'
      });
      return;
    }

    const novaVenda: NovaVenda = {
      produtoId: produto.id,
      quantidadeVendida,
      precoVenda,
      observacoes: observacoes.trim() || undefined
    };

    console.log('Confirmando venda:', novaVenda);
    onConfirmar(novaVenda);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
            Registrar Venda
          </h2>
          <button
            onClick={onCancelar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações do produto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Produto Selecionado
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {produto.imagem ? (
                  <img
                    src={`http://localhost:5000/uploads/${produto.imagem}`}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{produto.nome}</h4>
                <p className="text-sm text-gray-600">
                  Estoque disponível: <span className="font-medium">{produto.quantidadeDisponivel}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Preço sugerido: <span className="font-medium text-green-600">
                    R$ {produto.precoSugeridoVenda.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade a Vender *
            </label>
            <input
              type="number"
              min="1"
              max={produto.quantidadeDisponivel}
              value={quantidadeVendida}
              onChange={(e) => setQuantidadeVendida(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo: {produto.quantidadeDisponivel} unidades
            </p>
          </div>

          {/* Preço de venda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço de Venda (por unidade) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Ex: Venda para cliente VIP, desconto aplicado..."
              disabled={isLoading}
            />
          </div>

          {/* Resumo da venda */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Resumo da Venda</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Quantidade:</span>
                <span className="font-medium text-blue-900">{quantidadeVendida} unidade(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Preço unitário:</span>
                <span className="font-medium text-blue-900">R$ {precoVenda.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2">
                <span className="font-medium text-blue-900">Valor Total:</span>
                <span className="font-bold text-blue-900 text-lg">R$ {valorTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Confirmar Venda
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioVenda;
