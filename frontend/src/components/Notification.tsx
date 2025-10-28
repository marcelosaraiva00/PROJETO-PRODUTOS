/**
 * COMPONENTE DE NOTIFICAÇÃO
 * 
 * Componente para exibir notificações temporárias na aplicação.
 * Suporta diferentes tipos: success, error, warning, info.
 * Possui auto-dismiss configurável e botão de fechar manual.
 */

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

/**
 * Props do componente Notification
 */
export interface NotificationProps {
  id: string;                    // ID único da notificação
  type: 'success' | 'error' | 'warning' | 'info'; // Tipo da notificação
  title: string;                 // Título da notificação
  message?: string;              // Mensagem opcional
  onClose: (id: string) => void; // Função para fechar a notificação
  duration?: number;             // Duração em ms (0 = não fecha automaticamente)
}

/**
 * Componente Notification - Exibe notificações temporárias
 */
const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  onClose,
  duration = 5000 // Padrão: 5 segundos
}) => {
  /**
   * Efeito para auto-dismiss da notificação
   * Configura um timer para fechar automaticamente após o tempo especificado
   */
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  /**
   * Retorna o ícone apropriado baseado no tipo da notificação
   */
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  /**
   * Retorna as classes CSS apropriadas baseadas no tipo da notificação
   */
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getStyles()} animate-in slide-in-from-right-full duration-300`}>
      <div className="flex items-start">
        {/* Ícone da notificação */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        {/* Conteúdo da notificação */}
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">{title}</h4>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
        </div>
        
        {/* Botão de fechar */}
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onClose(id)}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
