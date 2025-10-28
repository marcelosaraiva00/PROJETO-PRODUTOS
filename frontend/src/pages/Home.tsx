import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  BarChart3,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Gestão de Produtos',
      description: 'Cadastre, edite e organize todos os seus produtos em um só lugar',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Controle de Estoque',
      description: 'Acompanhe quantidades disponíveis e receba alertas de estoque baixo',
      color: 'green'
    },
    {
      icon: BarChart3,
      title: 'Análise de Preços',
      description: 'Calcule automaticamente preços de venda com margem configurável',
      color: 'purple'
    },
    {
      icon: Star,
      title: 'Relatórios Inteligentes',
      description: 'Dashboard com estatísticas e insights sobre seus produtos',
      color: 'yellow'
    }
  ];

  const quickActions = [
    {
      title: 'Adicionar Produto',
      description: 'Cadastre um novo produto',
      icon: Plus,
      action: () => navigate('/adicionar-produto'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Ver Produtos',
      description: 'Lista completa de produtos',
      icon: Package,
      action: () => navigate('/produtos'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Dashboard',
      description: 'Visão geral e estatísticas',
      icon: BarChart3,
      action: () => navigate('/dashboard'),
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
  <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">
            Bem-vindo ao Estoque Fácil
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Gerencie seu estoque, controle preços e acompanhe vendas de forma inteligente
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/adicionar-produto')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Cadastrar Primeiro Produto
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Ver Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-6 rounded-xl text-left transition-all duration-200 hover:scale-105 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <action.icon className="h-8 w-8" />
                <ArrowRight className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${getColorClasses(feature.color)}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Por que escolher nosso sistema?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fácil de Usar</h3>
            <p className="text-gray-600">Interface intuitiva que você aprende a usar em minutos</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aumente Suas Vendas</h3>
            <p className="text-gray-600">Controle de preços otimizado para maximizar seus lucros</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize Seu Estoque</h3>
            <p className="text-gray-600">Nunca mais perca produtos ou fique sem estoque</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pronto para começar?
        </h2>
        <p className="text-gray-600 mb-6">
          Cadastre seu primeiro produto e descubra como é fácil gerenciar seu negócio
        </p>
        <button
          onClick={() => navigate('/adicionar-produto')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center mx-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Começar Agora
        </button>
      </div>
    </div>
  );
};

export default Home;
