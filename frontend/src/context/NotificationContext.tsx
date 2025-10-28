/**
 * CONTEXTO DE NOTIFICAÇÕES
 * 
 * Gerencia o sistema de notificações da aplicação, permitindo exibir
 * mensagens de sucesso, erro, aviso e informação para o usuário.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification, { NotificationProps } from '../components/Notification';

/**
 * Interface do contexto de notificações
 */
interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'id' | 'onClose'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto de notificações
 * Gerencia lista de notificações ativas e renderiza o container
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  /**
   * Exibir nova notificação
   * Gera ID único e adiciona à lista de notificações ativas
   */
  const showNotification = (notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: removeNotification
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  /**
   * Remover notificação da lista
   * Chamado quando a notificação é fechada
   */
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Container fixo para exibir notificações no canto superior direito */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification key={notification.id} {...notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar o contexto de notificações
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};
