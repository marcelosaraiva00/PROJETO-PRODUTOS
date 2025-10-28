/**
 * DEFINIÇÕES DE TIPOS PARA AUTENTICAÇÃO
 * 
 * Este arquivo contém todas as interfaces relacionadas à autenticação de usuários,
 * incluindo estruturas para login, registro e respostas da API.
 */

/**
 * Interface para representar um usuário autenticado
 * Contém informações básicas do usuário logado
 */
export interface User {
  id: string;        // Identificador único do usuário
  username: string;   // Nome de usuário para login
}

/**
 * Interface para dados de login
 * Usada nos formulários de autenticação
 */
export interface LoginData {
  username: string; // Nome de usuário (obrigatório)
  password: string; // Senha do usuário (obrigatório)
}

/**
 * Interface para dados de registro
 * Usada nos formulários de criação de conta
 */
export interface RegisterData {
  username: string;    // Nome de usuário desejado (obrigatório)
  password: string;    // Senha desejada (obrigatório)
  nomeCompleto: string; // Nome completo do usuário (obrigatório)
  documento: string;   // CPF ou CNPJ (obrigatório)
  tipoDocumento: 'cpf' | 'cnpj'; // Tipo do documento (obrigatório)
}

/**
 * Interface para resposta de autenticação da API
 * Retornada após login bem-sucedido
 */
export interface AuthResponse {
  token: string;     // Token JWT para autenticação
  userId: string;     // ID do usuário autenticado
  username: string;   // Nome de usuário
}
