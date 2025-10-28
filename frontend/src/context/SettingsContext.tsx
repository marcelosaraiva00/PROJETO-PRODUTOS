/**
 * CONTEXTO DE CONFIGURAÇÕES
 * 
 * Gerencia as configurações globais da aplicação, incluindo:
 * - Tema (claro/escuro)
 * - Margem de lucro configurável
 * - Sincronização com backend e localStorage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { settingsService } from '../services/settingsService';

/**
 * Interface para configurações da aplicação
 */
interface AppSettings {
  theme: 'light' | 'dark';    // Tema da interface
  profitMargin: number;       // Margem de lucro em decimal (ex: 0.5 = 50%)
}

/**
 * Interface do contexto de configurações
 */
interface SettingsContextType {
  settings: AppSettings;                                    // Configurações atuais
  toggleTheme: () => void;                                  // Alternar tema
  updateProfitMargin: (margin: number) => Promise<void>;    // Atualizar margem de lucro
  loadSettings: () => Promise<void>;                         // Carregar configurações do backend
}

// Configurações padrão
const defaultSettings: AppSettings = {
  theme: 'light',
  profitMargin: 0.5 // 50% de margem de lucro padrão
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto de configurações
 * Gerencia estado das configurações e sincronização com backend/localStorage
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Carregar configurações do localStorage na inicialização
    const savedSettings = localStorage.getItem('appSettings');
    const initialSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    
    return {
      ...initialSettings,
      profitMargin: initialSettings.profitMargin !== undefined ? initialSettings.profitMargin : defaultSettings.profitMargin
    };
  });

  /**
   * Carregar margem de lucro do backend
   * Sincroniza com as configurações do servidor
   */
  const loadSettings = useCallback(async () => {
    try {
      const data = await settingsService.getProfitMargin();
      setSettings(prev => ({ ...prev, profitMargin: data.profitMargin }));
    } catch (error) {
      console.error('Erro ao carregar margem de lucro do backend:', error);
    }
  }, []);

  // Carregar configurações do backend na inicialização
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Salvar tema no localStorage sempre que for alterado
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify({ theme: settings.theme }));
  }, [settings.theme]);

  /**
   * Alternar entre tema claro e escuro
   */
  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  }, []);

  /**
   * Atualizar margem de lucro no backend
   * Sincroniza a mudança com o servidor
   */
  const updateProfitMargin = useCallback(async (margin: number) => {
    try {
      const data = await settingsService.updateProfitMargin({ newProfitMargin: margin });
      setSettings(prev => ({ ...prev, profitMargin: data.profitMargin }));
    } catch (error) {
      console.error('Erro ao atualizar margem de lucro no backend:', error);
    }
  }, []);

  const value: SettingsContextType = {
    settings,
    toggleTheme,
    updateProfitMargin,
    loadSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook para usar o contexto de configurações
 */
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
};
