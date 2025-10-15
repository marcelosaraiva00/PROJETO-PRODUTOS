import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import AdicionarProduto from './pages/AdicionarProduto';
import Vendas from './pages/Vendas';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-700 dark-theme:text-gray-300">Carregando...</div>; // Ou um spinner de carregamento
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente interno que usa o contexto
const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { carregarProdutos, carregarVendas } = useAppContext();
  const { settings } = useSettings();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Carregar estado inicial do sidebar
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Estado para detectar se é mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Atualizar quando a janela for redimensionada
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carregar dados iniciais APENAS se autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      carregarProdutos();
      carregarVendas();
    }
  }, [isAuthenticated, authLoading, carregarProdutos, carregarVendas]);

  // Aplicar tema no body
  useEffect(() => {
    document.body.className = settings.theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [settings.theme]);

  // Calcular a margem baseada no estado do sidebar
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
        {isAuthenticated && <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />}

        <div className="flex-1 flex flex-col">
          {isAuthenticated && (
            <div className={`transition-all duration-300 ${getContentMargin()}`}>
              <Header />
            </div>
          )}

          <main className={`flex-1 p-6 lg:p-8 transition-all duration-300 ${getContentMargin()}`}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
              <Route path="/adicionar-produto" element={<PrivateRoute><AdicionarProduto /></PrivateRoute>} />
              <Route path="/vendas" element={<PrivateRoute><Vendas /></PrivateRoute>} />
              <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
              <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />

              {/* Redireciona qualquer rota desconhecida para a home se autenticado, ou login se não */}
              <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

// Componente principal com providers
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
