import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Package, DollarSign } from 'lucide-react';
import { NovoProduto } from '../types/Produto';
import { produtoService } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const AdicionarProduto: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    precoCompra: '',
    quantidadeComprada: '',
  });
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState<string | null>(null);

  const { settings } = useSettings();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.precoCompra || !formData.quantidadeComprada) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setIsLoading(true);
      const novoProduto: NovoProduto = {
        nome: formData.nome,
        precoCompra: parseFloat(formData.precoCompra),
        quantidadeComprada: parseInt(formData.quantidadeComprada),
        imagem: imagem || undefined,
      };

      await produtoService.cadastrar(novoProduto);
      alert('Produto cadastrado com sucesso!');
      navigate('/produtos');
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularPrecoSugerido = () => {
    const precoCompra = parseFloat(formData.precoCompra);
    if (isNaN(precoCompra)) return 0;
    return precoCompra * (1 + settings.profitMargin); // Usar margem de lucro das configurações
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/produtos')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adicionar Produto</h1>
          <p className="text-gray-600">Cadastre um novo produto no sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Informações do Produto
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Preencha os dados básicos do produto
              </p>
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
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/produtos')}
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
                      Cadastrar Produto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview e informações */}
        <div className="space-y-6">
          {/* Preview do preço sugerido */}
          {formData.precoCompra && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Preço Sugerido
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(calcularPrecoSugerido())}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Margem de {(settings.profitMargin * 100).toFixed(0)}% sobre o preço de compra
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Preço de Compra:</span>
                      <span>{formatCurrency(parseFloat(formData.precoCompra) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margem:</span>
                      <span>{(settings.profitMargin * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dicas */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Dicas</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Nome descritivo:</strong> Use um nome claro que identifique o produto
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Preço exato:</strong> Informe o valor real pago pelo produto
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Foto de qualidade:</strong> Uma boa imagem ajuda na identificação
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Margem automática:</strong> O sistema calcula automaticamente o preço de venda
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdicionarProduto;
