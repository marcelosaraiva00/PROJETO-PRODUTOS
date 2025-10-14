import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { settingsService } from '../services/settingsService';

interface AppSettings {
  theme: 'light' | 'dark';
  profitMargin: number; // Porcentagem de margem de lucro (ex: 0.5 para 50%)
}

interface SettingsContextType {
  settings: AppSettings;
  toggleTheme: () => void;
  updateProfitMargin: (margin: number) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  profitMargin: 0.5 // 50% de margem de lucro padrão
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Carregar configurações do localStorage, se existirem
    const savedSettings = localStorage.getItem('appSettings');
    // Garante que profitMargin seja carregado corretamente do localStorage, se não existir usa o default
    const initialSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    return {
      ...initialSettings,
      profitMargin: initialSettings.profitMargin !== undefined ? initialSettings.profitMargin : defaultSettings.profitMargin
    };
  });

  const loadSettings = useCallback(async () => {
    try {
      const data = await settingsService.getProfitMargin();
      setSettings(prev => ({ ...prev, profitMargin: data.profitMargin }));
    } catch (error) {
      console.error('Erro ao carregar margem de lucro do backend:', error);
      // Opcional: mostrar uma notificação de erro
    }
  }, []);

  // Carregar configurações do backend na inicialização
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Salvar configurações no localStorage sempre que forem atualizadas (apenas tema)
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify({ theme: settings.theme }));
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  }, []);

  const updateProfitMargin = useCallback(async (margin: number) => {
    try {
      const data = await settingsService.updateProfitMargin({ newProfitMargin: margin });
      setSettings(prev => ({ ...prev, profitMargin: data.profitMargin }));
    } catch (error) {
      console.error('Erro ao atualizar margem de lucro no backend:', error);
      // Opcional: mostrar uma notificação de erro
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

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
};
