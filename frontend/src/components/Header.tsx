/**
 * COMPONENTE HEADER
 * 
 * Cabeçalho principal da aplicação que contém:
 * - Título do sistema
 * - Barra de pesquisa (desktop)
 * - Botão de notificações
 * - Informações do usuário logado
 * - Botão de logout
 */

import React, { FC } from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente Header - Cabeçalho principal da aplicação
 */
const Header: FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark-theme:bg-gray-800 shadow-sm border-b border-gray-200 dark-theme:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Seção esquerda - Título do sistema (visível apenas no desktop) */}
        <div className="flex items-center">
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-900 dark-theme:text-gray-100">
              Estoque Fácil
            </h1>
          </div>
        </div>

        {/* Seção central - Barra de pesquisa (oculta no mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark-theme:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark-theme:bg-gray-700 dark-theme:text-gray-100"
            />
          </div>
        </div>

        {/* Seção direita - Ações e informações do usuário */}
        <div className="flex items-center space-x-4">
          {/* Botão de notificações com indicador */}
          <button className="p-2 text-gray-400 hover:text-gray-600 dark-theme:hover:text-gray-300 hover:bg-gray-100 dark-theme:hover:bg-gray-700 rounded-lg transition-colors relative">
            <Bell className="h-5 w-5" />
            {/* Indicador de notificação não lida */}
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Informações do usuário e botão de logout */}
          {user && (
            <div className="flex items-center space-x-3">
              {/* Informações do usuário */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark-theme:text-gray-100">
                  Olá, {user.username}
                </div>
                <div className="text-xs text-gray-500 dark-theme:text-gray-400">Usuário</div>
              </div>
              
              {/* Avatar do usuário com inicial */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              
              {/* Botão de logout */}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark-theme:hover:bg-gray-700 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
