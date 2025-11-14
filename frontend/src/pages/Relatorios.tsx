import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Package,
  Calendar,
  FileDown,
  LineChart,
  PieChart,
  AlertTriangle
} from 'lucide-react';
import { Produto } from '../types/Produto';
import { produtoService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

const Relatorios: React.FC = () => {
  const { user } = useAuth();
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

  const estatisticas = useMemo(() => getEstatisticasRelatorio(), [produtos, filtroPeriodo]);

  const estoquePorMes = useMemo(() => {
    if (produtos.length === 0) {
      return [];
    }

    const agora = new Date();
    const meses: Array<{ label: string; valor: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const referencia = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const labelMes = referencia
        .toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '')
        .toUpperCase();
      const label = `${labelMes}/${String(referencia.getFullYear()).slice(-2)}`;

      const valor = produtos.reduce((total, produto) => {
        const dataCadastro = new Date(produto.dataCadastro);
        if (
          dataCadastro.getFullYear() === referencia.getFullYear() &&
          dataCadastro.getMonth() === referencia.getMonth()
        ) {
          return total + produto.precoCompra * produto.quantidadeDisponivel;
        }
        return total;
      }, 0);

      meses.push({ label, valor });
    }

    return meses;
  }, [produtos]);

  const maxValorEstoqueSerie = useMemo(() => {
    if (estoquePorMes.length === 0) {
      return 0;
    }

    return estoquePorMes.reduce((max, item) => Math.max(max, item.valor), 0);
  }, [estoquePorMes]);

  const distribuicaoEstoque = useMemo(() => {
    const base = estatisticas.produtosFiltrados;

    if (base.length === 0) {
      return {
        counts: { alto: 0, medio: 0, baixo: 0 },
        percent: { alto: 0, medio: 0, baixo: 0 },
      };
    }

    const counts = base.reduce(
      (acc, produto) => {
        const porcentagem =
          produto.quantidadeComprada === 0
            ? 0
            : (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;

        if (porcentagem > 50) {
          acc.alto += 1;
        } else if (porcentagem > 20) {
          acc.medio += 1;
        } else {
          acc.baixo += 1;
        }

        return acc;
      },
      { alto: 0, medio: 0, baixo: 0 }
    );

    const total = base.length;

    return {
      counts,
      percent: {
        alto: Math.round((counts.alto / total) * 100),
        medio: Math.round((counts.medio / total) * 100),
        baixo: Math.round((counts.baixo / total) * 100),
      },
    };
  }, [estatisticas.produtosFiltrados]);

  const novosProdutos30Dias = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);

    return estatisticas.produtosFiltrados.filter(
      (produto) => new Date(produto.dataCadastro) >= limite
    ).length;
  }, [estatisticas.produtosFiltrados]);

  const margemMedia = useMemo(() => {
    if (estatisticas.produtosFiltrados.length === 0) {
      return 0;
    }
    return estatisticas.margemTotal / estatisticas.produtosFiltrados.length;
  }, [estatisticas]);

  const valorMedioEstoque = useMemo(() => {
    if (estatisticas.produtosFiltrados.length === 0) {
      return 0;
    }
    return estatisticas.valorTotalEstoque / estatisticas.produtosFiltrados.length;
  }, [estatisticas]);

  const insightsRapidos = [
    {
      title: 'Novos produtos (30 dias)',
      value: novosProdutos30Dias.toString(),
      description: 'Entradas recentes adicionadas ao estoque',
      accent: '#2563eb',
      icon: Package,
    },
    {
      title: 'Estoque crítico',
      value: estatisticas.produtosEstoqueBaixo.length.toString(),
      description: 'Itens abaixo de 20% do estoque inicial',
      accent: '#dc2626',
      icon: AlertTriangle,
    },
    {
      title: 'Margem média por produto',
      value: formatCurrency(margemMedia),
      description: 'Lucro potencial médio por item',
      accent: '#16a34a',
      icon: TrendingUp,
    },
    {
      title: 'Valor médio em estoque',
      value: formatCurrency(valorMedioEstoque),
      description: 'Investimento por produto disponível',
      accent: '#9333ea',
      icon: DollarSign,
    },
  ];

  const niveisEstoque = [
    {
      key: 'alto' as const,
      label: 'Estoque Alto (> 50%)',
      color: '#16a34a',
    },
    {
      key: 'medio' as const,
      label: 'Estoque Médio (21% - 50%)',
      color: '#f97316',
    },
    {
      key: 'baixo' as const,
      label: 'Estoque Baixo (≤ 20%)',
      color: '#dc2626',
    },
  ];

  const exportarPDF = () => {
    const estatisticasPDF = estatisticas;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Configurações
    const pageWidth = 210;
    const pageHeight = 297;
    let yPosition = 20;
    
    // Cores
    pdf.setDrawColor(37, 99, 235); // Blue-600
    pdf.setFillColor(37, 99, 235);
    
    // Cabeçalho
    pdf.setFontSize(24);
    pdf.setTextColor(37, 99, 235);
    pdf.text('Relatório de Estoque', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setTextColor(107, 114, 128);
    pdf.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 8;
    
    pdf.text(
      `Usuário: ${user?.nomeCompleto || 'N/A'}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 8;
    
    pdf.text(
      `Período: ${
        filtroPeriodo === 'todos' ? 'Todos os períodos' :
        filtroPeriodo === 'semana' ? 'Última semana' :
        'Último mês'
      }`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 15;
    
    // Linha divisória
    pdf.setDrawColor(229, 231, 235);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;
    
    // Estatísticas principais
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Resumo Financeiro', 20, yPosition);
    yPosition += 12;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Cards de estatísticas
    const cardWidth = 85;
    const cardHeight = 40;
    const cardsPerRow = 2;
    const cards: Array<{label: string, value: string}> = [
      { label: 'Total de Produtos', value: estatisticasPDF.totalProdutos.toString() },
      { label: 'Valor em Estoque', value: formatCurrency(estatisticasPDF.valorTotalEstoque) },
      { label: 'Valor Potencial', value: formatCurrency(estatisticasPDF.valorPotencialVendas) },
      { label: 'Margem Total', value: formatCurrency(estatisticasPDF.margemTotal) }
    ];
    
    for (let i = 0; i < cards.length; i++) {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      const x = 20 + col * 95;
      const y = yPosition + row * 45;
      
      // Card
      pdf.setDrawColor(229, 231, 235);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');
      
      // Label
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(cards[i].label, x + 5, y + 8);
      
      // Value
      pdf.setFontSize(12);
      pdf.setTextColor(31, 41, 55);
      pdf.text(cards[i].value, x + 5, y + 20, { maxWidth: cardWidth - 10 });
    }
    
    yPosition += cardHeight * 2 + 15;
    
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Top Produtos por Margem
    if (estatisticasPDF.produtosComMargem.length > 0) {
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Top Produtos por Margem', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      
      estatisticasPDF.produtosComMargem.slice(0, 5).forEach((produto, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setTextColor(31, 41, 55);
        pdf.text(`#${index + 1} ${produto.nome}`, 25, yPosition);
        pdf.setTextColor(34, 197, 94);
        pdf.text(`+${produto.margemPercentual.toFixed(1)}%`, 170, yPosition, { align: 'right' });
        
        yPosition += 8;
      });
      
      yPosition += 10;
    }
    
    // Produtos com Estoque Baixo
    if (estatisticasPDF.produtosEstoqueBaixo.length > 0) {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Alerta de Estoque', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      
      estatisticasPDF.produtosEstoqueBaixo.forEach((produto) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const porcentagem = (produto.quantidadeDisponivel / produto.quantidadeComprada) * 100;
        pdf.setTextColor(31, 41, 55);
        pdf.text(produto.nome, 25, yPosition);
        pdf.setTextColor(220, 38, 38);
        pdf.text(
          `${produto.quantidadeDisponivel}/${produto.quantidadeComprada} (${porcentagem.toFixed(1)}%)`,
          170,
          yPosition,
          { align: 'right' }
        );
        
        yPosition += 8;
      });
    }
    
    // Rodapé
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(156, 163, 175);
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    // Download
    const periodo = filtroPeriodo === 'todos' ? 'completo' : filtroPeriodo === 'semana' ? 'semana' : 'mes';
    const nomeArquivo = `relatorio_estoque_${periodo}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(nomeArquivo);
  };

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
          <button 
            onClick={exportarPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md hover:shadow-lg"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
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

      {/* Visualizações principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <LineChart className="h-5 w-5 text-blue-600 mr-2" />
                Valor em Estoque (últimos 6 meses)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Evolução do investimento considerando o custo de aquisição de cada produto.
              </p>
            </div>
        <div
          className="icon-wrapper-square"
          style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff', color: '#2563eb' }}
        >
          <DollarSign className="icon-wrapper-square__icon" />
        </div>
          </div>
        </div>
        <div className="p-6 md:p-8">
          {estoquePorMes.length === 0 || maxValorEstoqueSerie === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500">
              Nenhum dado disponível para exibir o histórico de estoque.
            </div>
          ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div
                  className="flex justify-between items-end"
                  style={{ minHeight: '200px', gap: '1.5rem', padding: '0 0.75rem' }}
                >
                {estoquePorMes.map((item) => {
                  const altura = Math.max((item.valor / maxValorEstoqueSerie) * 100, 6);
                  return (
                      <div key={item.label} className="flex-1 flex flex-col items-center">
                        <div
                          className="flex items-end justify-center w-full rounded-xl"
                          style={{
                            height: '150px',
                            padding: '0.5rem 0.35rem',
                            backgroundColor: 'rgba(255,255,255,0.35)',
                            border: '1px solid rgba(191, 219, 254, 0.6)',
                          }}
                        >
                        <div
                          style={{
                            height: `${altura}%`,
                            minHeight: '18px',
                            width: '100%',
                            maxWidth: '46px',
                            borderRadius: '12px 12px 6px 6px',
                            background: 'linear-gradient(180deg, rgba(37,99,235,0.85) 0%, rgba(29,78,216,0.95) 100%)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            boxShadow: '0 10px 20px -12px rgba(37,99,235,0.6)',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: '#ffffff',
                              fontWeight: 700,
                              marginBottom: '6px',
                              textAlign: 'center',
                              padding: '0 6px',
                              lineHeight: 1.1,
                            }}
                          >
                            {formatCurrency(item.valor)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 px-3 py-1 rounded-full bg-white border border-blue-100 text-xs font-semibold text-blue-700 shadow-sm">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 text-purple-600 mr-2" />
                Distribuição de Estoque
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Percentual de produtos por nível de cobertura de estoque.
              </p>
            </div>
        <div
          className="icon-wrapper-square"
          style={{ borderColor: '#d8b4fe', backgroundColor: '#f3e8ff', color: '#7c3aed' }}
        >
          <Package className="icon-wrapper-square__icon" />
        </div>
          </div>
        </div>
          <div className="p-6 md:p-8 space-y-5">
            {estatisticas.produtosFiltrados.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-500">
                Cadastre produtos para visualizar a distribuição de estoque.
              </div>
            ) : (
              niveisEstoque.map((nivel) => (
                <div key={nivel.key}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="font-medium text-gray-700">{nivel.label}</span>
                    <span className="text-gray-500">
                      {distribuicaoEstoque.counts[nivel.key]} produtos · {distribuicaoEstoque.percent[nivel.key]}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${distribuicaoEstoque.percent[nivel.key]}%`,
                        backgroundColor: nivel.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Insights rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insightsRapidos.map((insight) => {
          const Icone = insight.icon;
          return (
            <div key={insight.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{insight.title}</p>
                  <p className="mt-3 text-3xl font-bold" style={{ color: insight.accent }}>
                    {insight.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: `${insight.accent}1A`,
                    borderColor: `${insight.accent}33`,
                  }}
                >
                <Icone className="icon-wrapper-square__icon" style={{ color: insight.accent }} />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">{insight.description}</p>
              <div
                className="mt-4 h-1 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${insight.accent} 0%, ${insight.accent}AA 100%)`,
                }}
              ></div>
          </div>
          );
        })}
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
