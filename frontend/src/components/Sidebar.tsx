import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  BarChart3, 
  Settings,
  Home,
  ShoppingCart,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Início',
      description: 'Página inicial'
    },
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Visão geral e estatísticas'
    },
    {
      path: '/produtos',
      icon: Package,
      label: 'Produtos',
      description: 'Listar e gerenciar produtos'
    },
    {
      path: '/adicionar-produto',
      icon: Plus,
      label: 'Adicionar Produto',
      description: 'Cadastrar novo produto'
    },
    {
      path: '/vendas',
      icon: ShoppingCart,
      label: 'Vendas',
      description: 'Registrar vendas e baixa estoque'
    },
    {
      path: '/relatorios',
      icon: BarChart3,
      label: 'Relatórios',
      description: 'Relatórios e análises'
    },
    {
      path: '/configuracoes',
      icon: Settings,
      label: 'Configurações',
      description: 'Configurações do sistema'
    }
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark-theme:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
        w-80 lg:w-72 border-r border-gray-200 dark-theme:border-gray-700
      `}>
        <div className="flex flex-col h-full">
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark-theme:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900 dark-theme:text-gray-100">Sistema</h1>
                <p className="text-xs text-gray-500 dark-theme:text-gray-400">Produtos</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark-theme:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark-theme:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center p-3 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-50 dark-theme:bg-blue-900 text-blue-700 dark-theme:text-blue-300 border-r-2 border-blue-500' 
                      : 'text-gray-600 dark-theme:text-gray-300 hover:bg-gray-50 dark-theme:hover:bg-gray-700 hover:text-gray-900 dark-theme:hover:text-gray-100'
                    }
                  `}
                  onClick={() => {
                    // Fechar sidebar no mobile ao navegar
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <item.icon className={`
                    h-5 w-5 mr-3 transition-colors
                    ${menuItems.find(m => m.path === item.path)?.path === window.location.pathname 
                      ? 'text-blue-600 dark-theme:text-blue-300' 
                      : 'text-gray-400 group-hover:text-gray-600 dark-theme:group-hover:text-gray-300'
                    }
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 dark-theme:text-gray-400 mt-0.5">{item.description}</div>
                  </div>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer da Sidebar com informações do usuário logado e botão de logout */}
          <div className="p-6 border-t border-gray-200 dark-theme:border-gray-700">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark-theme:text-gray-100">{user.username}</div>
                    <div className="text-xs text-gray-500 dark-theme:text-gray-400">Usuário</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark-theme:hover:bg-gray-700 text-gray-400 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-600 dark-theme:text-gray-300">
                Faça login para ver o perfil.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
