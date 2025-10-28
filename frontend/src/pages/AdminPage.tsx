/**
 * PÁGINA DE ADMINISTRAÇÃO
 * 
 * Interface para administradores gerenciarem usuários,
 * incluindo aprovação e rejeição de novos cadastros.
 */

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Shield, RefreshCw } from 'lucide-react';
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Administração de Usuários
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie usuários e aprove novos cadastros
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Aguardando Aprovação ({pendingUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Todos os Usuários ({allUsers.length})
              </button>
            </nav>
          </div>
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
              <div className="bg-white shadow rounded-lg">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum usuário aguardando aprovação
                    </h3>
                    <p className="text-gray-600">
                      Todos os usuários já foram processados
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuário
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data de Cadastro
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingUsers.map((pendingUser) => (
                          <tr key={pendingUser.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {pendingUser.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {pendingUser.nomeCompleto}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDocument(pendingUser.documento, pendingUser.tipoDocumento)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pendingUser.tipoDocumento.toUpperCase()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(pendingUser.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproveUser(pendingUser.id, pendingUser.username)}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleRejectUser(pendingUser.id, pendingUser.username)}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
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
              <div className="bg-white shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data de Cadastro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username}
                                  {user.isAdmin && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDocument(user.documento, user.tipoDocumento)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.tipoDocumento.toUpperCase()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isApproved ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprovado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(user.createdAt)}
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
