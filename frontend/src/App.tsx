/**
 * COMPONENTE PRINCIPAL DA APLICAÇÃO
 * 
 * Este é o componente raiz da aplicação React que configura:
 * - Roteamento com React Router
 * - Providers de contexto (autenticação, notificações, configurações, app)
 * - Rotas protegidas e públicas
 * - Layout responsivo com sidebar
 * - Gerenciamento de estado global
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importações dos componentes de layout
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Importações das páginas
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import AdicionarProduto from './pages/AdicionarProduto';
import Vendas from './pages/Vendas';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

/**
 * Props do componente PrivateRoute
 */
interface PrivateRouteProps {
  children: JSX.Element;
}

/**
 * Componente para rotas protegidas
 * Verifica se o usuário está autenticado antes de renderizar o conteúdo
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-700 dark-theme:text-gray-300">Carregando...</div>;
  }

  // Redirecionar para login se não autenticado
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Componente interno que usa os contextos
 * Contém a lógica principal da aplicação e layout
 */
const AppContent: React.FC = () => {
  // Estados para controle do sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Iniciar recolhido por padrão
  
  // Contextos necessários
  const { carregarProdutos, carregarVendas } = useAppContext();
  const { settings } = useSettings();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  /**
   * Alternar estado do sidebar (aberto/fechado)
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Carregar estado do sidebar do localStorage na inicialização
   * Se não houver estado salvo, mantém o padrão recolhido (true)
   */
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
    // Se não houver estado salvo, mantém o padrão recolhido (true)
  }, []);

  // Estado para detectar se é dispositivo móvel
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  /**
   * Atualizar estado de mobile quando a janela for redimensionada
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Carregar dados iniciais apenas se o usuário estiver autenticado
   */
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      carregarProdutos();
      carregarVendas();
    }
  }, [isAuthenticated, authLoading, carregarProdutos, carregarVendas]);

  /**
   * Aplicar tema no body do documento
   */
  useEffect(() => {
    document.body.className = settings.theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [settings.theme]);

  /**
   * Calcular margem do conteúdo baseada no estado do sidebar
   * Responsivo para mobile e desktop
   */
  const getContentMargin = () => {
    if (isMobile && sidebarOpen) {
      return 'ml-80'; // 320px para mobile com sidebar aberto
    }
    if (!isMobile && !sidebarCollapsed) {
      return 'lg:ml-80'; // 320px para desktop com sidebar expandido
    }
    if (!isMobile && sidebarCollapsed) {
      return 'lg:ml-20'; // 80px para desktop com sidebar recolhido
    }
    return ''; // Sem margem
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`min-h-screen flex transition-all duration-300 ${getContentMargin()}`}>
        {/* Sidebar - apenas se autenticado */}
        {isAuthenticated && <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />}

        <div className="flex-1 flex flex-col">
          {/* Header - apenas se autenticado */}
          {isAuthenticated && (
            <div className={`transition-all duration-300 ${getContentMargin()}`}>
              <Header />
            </div>
          )}

          {/* Conteúdo principal com rotas */}
          <main className={`flex-1 p-6 lg:p-8 transition-all duration-300 ${getContentMargin()}`}>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rotas protegidas */}
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
              <Route path="/adicionar-produto" element={<PrivateRoute><AdicionarProduto /></PrivateRoute>} />
              <Route path="/vendas" element={<PrivateRoute><Vendas /></PrivateRoute>} />
              <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
              <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />

              {/* Rota catch-all - redireciona baseado no estado de autenticação */}
              <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente principal da aplicação
 * Configura todos os providers necessários na ordem correta
 */
const App: React.FC = () => {
  return (
    <Router>
      <NotificationProvider>
        <SettingsProvider>
          <AuthProvider>
            <AppProvider>
              <AppContent />
            </AppProvider>
          </AuthProvider>
        </SettingsProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;
