/**
 * CONTEXTO DE AUTENTICAÇÃO
 * 
 * Este contexto gerencia todo o estado de autenticação da aplicação,
 * incluindo login, logout, registro e persistência de dados do usuário.
 * 
 * Funcionalidades:
 * - Gerenciamento de estado do usuário logado
 * - Persistência de token e dados no localStorage
 * - Redirecionamento automático após login/logout
 * - Validação de autenticação
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { LoginData, RegisterData, User, AuthResponse } from '../types/Auth';

/**
 * Interface que define o tipo do contexto de autenticação
 * Contém todas as funções e estados relacionados à autenticação
 */
interface AuthContextType {
  user: User | null;                    // Dados do usuário logado (null se não autenticado)
  token: string | null;                 // Token JWT atual (null se não autenticado)
  login: (credentials: LoginData) => Promise<void>;        // Função para fazer login
  register: (userData: RegisterData) => Promise<void>;    // Função para registrar usuário
  logout: () => void;                   // Função para fazer logout
  isAuthenticated: boolean;             // Indica se o usuário está autenticado
  isLoading: boolean;                   // Indica se está carregando (login/registro)
}

// Criação do contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props do componente AuthProvider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto de autenticação
 * Gerencia todo o estado de autenticação da aplicação
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estados do contexto
  const [user, setUser] = useState<User | null>(null);           // Usuário atual
  const [token, setToken] = useState<string | null>(null);        // Token atual
  const [isLoading, setIsLoading] = useState(true);              // Estado de carregamento
  const navigate = useNavigate();                                 // Hook para navegação

  /**
   * Efeito para carregar dados de autenticação do localStorage na inicialização
   * Verifica se existe token e dados do usuário salvos localmente
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Se existem dados salvos, restaurar o estado de autenticação
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false); // Finalizar carregamento inicial
  }, []);

  /**
   * Função para realizar login do usuário
   * Autentica o usuário e salva os dados no localStorage
   */
  const login = useCallback(async (credentials: LoginData) => {
    setIsLoading(true);
    try {
      // Chamar serviço de autenticação
      const response: AuthResponse = await authService.login(credentials);
      
      // Atualizar estados locais PRIMEIRO
      setToken(response.token);
      
      // Salvar token no localStorage ANTES de buscar dados do usuário
      localStorage.setItem('token', response.token);
      
      // Buscar dados completos do usuário (agora com token salvo)
      const userData = await authService.getCurrentUser();
      
      // Atualizar estado do usuário
      setUser(userData);
      
      // Salvar dados completos do usuário no localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirecionar para a página inicial após login bem-sucedido
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error; // Propagar o erro para o componente que chamou
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Função para registrar novo usuário
   * Cria uma nova conta e redireciona para login
   */
  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Chamar serviço de registro
      await authService.register(userData);
      
      // Após registro bem-sucedido, redirecionar para tela de login
      navigate('/login');
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error; // Propagar o erro para o componente que chamou
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Função para fazer logout do usuário
   * Limpa todos os dados de autenticação e redireciona para login
   */
  const logout = useCallback(() => {
    // Limpar estados locais
    setToken(null);
    setUser(null);
    
    // Remover dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirecionar para página de login
    navigate('/login');
  }, [navigate]);

  // Calcular se o usuário está autenticado
  const isAuthenticated = !!token && !!user;

  // Valor do contexto com todas as funções e estados
  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar o contexto de autenticação
 * Garante que o contexto seja usado apenas dentro do AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
