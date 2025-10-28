import React, { FC, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Plus,
  BarChart3,
  Settings,
  Home,
  ShoppingCart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onToggle, isMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true); // Iniciar recolhido por padrão

  // Estado persistente do sidebar
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      const collapsed = JSON.parse(savedState);
      console.log('Carregando estado salvo:', collapsed);
      setIsCollapsed(collapsed);
    } else {
      console.log('Nenhum estado salvo, usando padrão: true (recolhido)');
      // Não precisa definir setIsCollapsed aqui pois já está como true por padrão
    }
  }, []);

  // Salvar estado no localStorage e debug
  useEffect(() => {
    console.log('isCollapsed mudou para:', isCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Início',
      description: 'Página inicial',
      shortLabel: 'Início'
    },
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Visão geral e estatísticas',
      shortLabel: 'Dashboard'
    },
    {
      path: '/produtos',
      icon: Package,
      label: 'Produtos',
      description: 'Listar e gerenciar produtos',
      shortLabel: 'Produtos'
    },
    {
      path: '/adicionar-produto',
      icon: Plus,
      label: 'Adicionar Produto',
      description: 'Cadastrar novo produto',
      shortLabel: 'Adicionar'
    },
    {
      path: '/vendas',
      icon: ShoppingCart,
      label: 'Vendas',
      description: 'Registrar vendas e baixa estoque',
      shortLabel: 'Vendas'
    },
    {
      path: '/relatorios',
      icon: BarChart3,
      label: 'Relatórios',
      description: 'Relatórios e análises',
      shortLabel: 'Relatórios'
    },
    {
      path: '/configuracoes',
      icon: Settings,
      label: 'Configurações',
      description: 'Configurações do sistema',
      shortLabel: 'Config'
    }
  ];

  const toggleCollapse = () => {
    console.log('Antes do toggle - isCollapsed:', isCollapsed);
    const newState = !isCollapsed;
    console.log('Novo estado será:', newState);
    setIsCollapsed(newState);
    console.log('Estado definido, agora verificando...');
  };

  const handleNavClick = () => {
    // Fechar sidebar no mobile ao navegar
    if (isMobile) {
      onToggle();
    }
  };

  const getSidebarWidth = () => {
    if (isMobile) {
      return isOpen ? 'w-80' : 'w-0';
    }
    return isCollapsed ? 'w-20' : 'w-80 lg:w-72';
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'}
        top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700
        ${getSidebarWidth()}
        ${isMobile && !isOpen ? '-translate-x-full invisible z-10' : (isMobile ? 'z-40' : 'z-20')}
        ${isMobile && !isOpen ? '' : 'visible'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sistema</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Produtos</p>
              </div>
            </div>

            {/* Botão de toggle para desktop */}
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className={`p-2 rounded-lg transition-all duration-200 group ${
                  isCollapsed ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                )}
              </button>
            )}

            {/* Botão de menu para mobile */}
            {isMobile && (
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>

          {/* Navegação */}
          <nav className={`flex-1 p-4 ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive: isNavActive }) => `
                      flex items-center p-3 rounded-xl transition-all duration-200 group relative
                      ${isNavActive || isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                      }
                    `}
                    onClick={handleNavClick}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>

                    {(() => {
                      if (isCollapsed || isMobile) {
                        return null; // Não renderiza nada quando recolhido ou mobile
                      }
                      return (
                        <div className="flex-1 ml-3 transition-all duration-200">
                          <div className="font-medium">{item.label}</div>
                          <div className={`text-xs mt-0.5 transition-colors ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      );
                    })()}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Footer da Sidebar com informações do usuário logado e botão de logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className={`flex items-center ${isCollapsed ? 'flex-col' : ''}`}>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {(() => {
                    if (isCollapsed || isMobile) {
                      return null; // Não renderiza quando recolhido ou mobile
                    }
                    return (
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Usuário</div>
                      </div>
                    );
                  })()}
                </div>

                {(() => {
                  if (isCollapsed || isMobile) {
                    return null; // Não renderiza quando recolhido ou mobile
                  }
                  return (
                    <button
                      onClick={logout}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                      title="Sair do sistema"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  );
                })()}
              </div>
            ) : (
              <div className={`text-center ${isCollapsed ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300`}>
                {(() => {
                  if (isCollapsed || isMobile) {
                    return null; // Não renderiza quando recolhido ou mobile
                  }
                  return 'Faça login para ver o perfil.';
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
