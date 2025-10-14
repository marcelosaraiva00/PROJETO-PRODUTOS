import React, { useState, useEffect } from 'react';
import { X, Upload, Package, DollarSign } from 'lucide-react';
import { Produto, NovoProduto } from '../types/Produto';

interface ProdutoFormProps {
  produto?: Produto | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (produto: NovoProduto) => void;
  isLoading?: boolean;
}

const ProdutoForm: React.FC<ProdutoFormProps> = ({
  produto,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    precoCompra: '',
    quantidadeComprada: '',
  });
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState<string | null>(null);

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome,
        precoCompra: produto.precoCompra.toString(),
        quantidadeComprada: produto.quantidadeComprada.toString(),
      });
      setPreviewImagem(produto.imagem ? `/uploads/${produto.imagem}` : null);
    } else {
      setFormData({
        nome: '',
        precoCompra: '',
        quantidadeComprada: '',
      });
      setPreviewImagem(null);
    }
    setImagem(null);
  }, [produto, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagem(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImagem(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.precoCompra || !formData.quantidadeComprada) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novoProduto: NovoProduto = {
      nome: formData.nome,
      precoCompra: parseFloat(formData.precoCompra),
      quantidadeComprada: parseInt(formData.quantidadeComprada),
      imagem: imagem || undefined,
    };

    onSubmit(novoProduto);
  };

  const calcularPrecoSugerido = () => {
    const precoCompra = parseFloat(formData.precoCompra);
    if (isNaN(precoCompra)) return 0;
    return precoCompra * 1.5; // Margem de 50%
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            {produto ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Digite o nome do produto"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="precoCompra" className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Compra *
              </label>
              <input
                type="number"
                id="precoCompra"
                name="precoCompra"
                value={formData.precoCompra}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label htmlFor="quantidadeComprada" className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade Comprada *
              </label>
              <input
                type="number"
                id="quantidadeComprada"
                name="quantidadeComprada"
                value={formData.quantidadeComprada}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="1"
                required
              />
            </div>
          </div>

          {formData.precoCompra && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center text-green-700 mb-2">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="font-medium">Preço Sugerido de Venda</span>
              </div>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(calcularPrecoSugerido())}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Margem de 50% sobre o preço de compra
              </div>
            </div>
          )}

          <div>
            <label htmlFor="imagem" className="block text-sm font-medium text-gray-700 mb-2">
              Foto do Produto
            </label>
            <div className="space-y-4">
              <input
                type="file"
                id="imagem"
                accept="image/*"
                onChange={handleImagemChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {previewImagem && (
                <div className="relative">
                  <img
                    src={previewImagem}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {produto ? 'Atualizar' : 'Cadastrar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProdutoForm;
