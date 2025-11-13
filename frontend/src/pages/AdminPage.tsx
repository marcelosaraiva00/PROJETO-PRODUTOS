/**
 * PÁGINA DE ADMINISTRAÇÃO
 * 
 * Interface para administradores gerenciarem usuários,
 * incluindo aprovação e rejeição de novos cadastros.
 */

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Shield, RefreshCw, Ban, Unlock, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { adminService } from '../services/adminService';
import { PendingUser } from '../types/Auth';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pendingData, allUsersData] = await Promise.all([
        adminService.getPendingUsers(),
        adminService.getAllUsers()
      ]);
      setPendingUsers(pendingData);
      setAllUsers(allUsersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar dados de usuários'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string, username: string) => {
    try {
      await adminService.approveUser(userId);
      showNotification({
        type: 'success',
        title: 'Usuário Aprovado',
        message: `${username} foi aprovado com sucesso!`
      });
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao aprovar usuário'
      });
    }
  };

  const handleRejectUser = async (userId: string, username: string) => {
    if (!window.confirm(`Tem certeza que deseja rejeitar o usuário ${username}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await adminService.rejectUser(userId);
      showNotification({
        type: 'success',
        title: 'Usuário Rejeitado',
        message: `${username} foi rejeitado e removido do sistema`
      });
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao rejeitar usuário'
      });
    }
  };

  const handleBlockUser = async (userId: string, username: string) => {
    const reason = window.prompt(`Por favor, informe o motivo do bloqueio do usuário ${username}:`, 'Bloqueado temporariamente por falta de pagamento');
    
    if (!reason) {
      return; // Usuário cancelou
    }

    try {
      await adminService.blockUser(userId, reason);
      showNotification({
        type: 'success',
        title: 'Usuário Bloqueado',
        message: `${username} foi bloqueado com sucesso`
      });
      loadData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao bloquear usuário:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao bloquear usuário';
      showNotification({
        type: 'error',
        title: 'Erro',
        message: errorMessage
      });
    }
  };

  const handleUnblockUser = async (userId: string, username: string) => {
    if (!window.confirm(`Tem certeza que deseja desbloquear o usuário ${username}?`)) {
      return;
    }

    try {
      await adminService.unblockUser(userId);
      showNotification({
        type: 'success',
        title: 'Usuário Desbloqueado',
        message: `${username} foi desbloqueado com sucesso`
      });
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao desbloquear usuário'
      });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n` +
      `Tem certeza que deseja DELETAR permanentemente o usuário ${username}?\n\n` +
      `Todos os produtos e vendas deste usuário serão removidos do sistema.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      showNotification({
        type: 'success',
        title: 'Usuário Deletado',
        message: `${username} foi deletado permanentemente do sistema`
      });
      loadData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao deletar usuário';
      showNotification({
        type: 'error',
        title: 'Erro',
        message: errorMessage
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDocument = (documento: string, tipo: string) => {
    if (tipo === 'cpf') {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Calcular estatísticas
  const stats = {
    total: allUsers.length,
    approved: allUsers.filter(u => u.isApproved && !u.isBlocked).length,
    pending: pendingUsers.length,
    blocked: allUsers.filter(u => u.isBlocked).length,
    admins: allUsers.filter(u => u.isAdmin).length
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com gradiente */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl mr-4">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Painel de Administração
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Gerenciamento completo de usuários
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Aprovados</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Bloqueados</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.blocked}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Administradores</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.admins}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Redesenhadas */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-2">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Aguardando Aprovação
              {pendingUsers.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs font-bold">
                  {pendingUsers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Todos os Usuários
              <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs font-bold">
                {allUsers.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando...</span>
          </div>
        ) : (
          <>
            {/* Pending Users Tab */}
            {activeTab === 'pending' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Nenhum usuário aguardando aprovação
                    </h3>
                    <p className="text-gray-600">
                      Todos os usuários já foram processados
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-yellow-400 to-orange-400">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Usuário
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Documento
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Data de Cadastro
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingUsers.map((pendingUser, index) => (
                          <tr key={pendingUser.id} className={`hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                  {pendingUser.username[0].toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900">
                                    {pendingUser.username}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {pendingUser.nomeCompleto}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDocument(pendingUser.documento, pendingUser.tipoDocumento)}
                              </div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">
                                {pendingUser.tipoDocumento}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(pendingUser.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproveUser(pendingUser.id, pendingUser.username)}
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleRejectUser(pendingUser.id, pendingUser.username)}
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rejeitar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* All Users Tab */}
            {activeTab === 'all' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ width: '25%' }}>
                          Usuário
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ width: '20%' }}>
                          Documento
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ width: '25%' }}>
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ width: '18%' }}>
                          Data de Cadastro
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ width: '12%' }}>
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers.map((user, index) => (
                        <tr key={user.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {user.username[0].toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900 flex items-center">
                                  {user.username}
                                  {user.isAdmin && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.nomeCompleto}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDocument(user.documento, user.tipoDocumento)}
                            </div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">
                              {user.tipoDocumento}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-2 min-w-[200px]">
                              {user.isApproved ? (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md whitespace-nowrap">
                                  <CheckCircle className="w-3 h-3 mr-1.5" />
                                  Aprovado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md whitespace-nowrap">
                                  <Clock className="w-3 h-3 mr-1.5" />
                                  Pendente
                                </span>
                              )}
                              {user.isBlocked && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md whitespace-nowrap">
                                    <AlertCircle className="w-3 h-3 mr-1.5" />
                                    Bloqueado
                                  </span>
                                  <div className="text-xs text-gray-600 italic break-words max-w-[180px]">
                                    {user.blockReason || 'Sem motivo especificado'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                            {!user.isAdmin && (
                              <div className="flex space-x-2">
                                {user.isBlocked ? (
                                  <button
                                    onClick={() => handleUnblockUser(user.id, user.username)}
                                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                                    title="Desbloquear usuário"
                                  >
                                    <Unlock className="w-4 h-4 mr-1" />
                                    Desbloquear
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBlockUser(user.id, user.username)}
                                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                                    title="Bloquear usuário"
                                  >
                                    <Ban className="w-4 h-4 mr-1" />
                                    Bloquear
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
                                  title="Deletar usuário permanentemente"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Deletar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
