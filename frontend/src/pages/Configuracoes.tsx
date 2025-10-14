import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  RefreshCw
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useNotification } from '../context/NotificationContext';

const Configuracoes: React.FC = () => {
  const { settings, toggleTheme, updateProfitMargin, loadSettings } = useSettings();
  const { showNotification } = useNotification();
  const [localProfitMargin, setLocalProfitMargin] = useState(settings.profitMargin * 100); // Converte para porcentagem para exibir
  const [notificacoes, setNotificacoes] = useState({
    estoqueBaixo: true,
    novosProdutos: true,
    relatorios: false
  });
  const [backup, setBackup] = useState({
    automatico: false,
    frequencia: 'semanal'
  });

  // Carregar as configurações mais recentes do backend ao montar o componente
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Atualizar a margem de lucro local quando a global mudar
  useEffect(() => {
    setLocalProfitMargin(settings.profitMargin * 100);
  }, [settings.profitMargin]);

  const handleNotificacaoChange = (field: string, value: boolean) => {
    setNotificacoes(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackupChange = (field: string, value: string | boolean) => {
    setBackup(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMargemChange = (value: number) => {
    setLocalProfitMargin(value);
  };

  const salvarConfiguracoes = async () => {
    try {
      await updateProfitMargin(localProfitMargin / 100); // Salva como fração no backend
      // Aqui você salvaria as outras configurações (notificações, backup) em um estado global ou backend
      showNotification({
        type: 'success',
        title: 'Configurações Salvas',
        message: 'As configurações foram salvas com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showNotification({
        type: 'error',
        title: 'Erro ao Salvar',
        message: 'Ocorreu um erro ao salvar as configurações. Tente novamente.'
      });
    }
  };

  const resetarConfiguracoes = async () => {
    if (window.confirm('Tem certeza que deseja resetar todas as configurações?')) {
      try {
        await updateProfitMargin(0.5); // Resetar para 50% no backend
        setNotificacoes({
          estoqueBaixo: true,
          novosProdutos: true,
          relatorios: false
        });
        setBackup({
          automatico: false,
          frequencia: 'semanal'
        });
        showNotification({
          type: 'info',
          title: 'Configurações Resetadas',
          message: 'As configurações foram resetadas para o padrão.'
        });
      } catch (error) {
        console.error('Erro ao resetar configurações:', error);
        showNotification({
          type: 'error',
          title: 'Erro ao Resetar',
          message: 'Ocorreu um erro ao resetar as configurações. Tente novamente.'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Personalize seu sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetarConfiguracoes}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </button>
          <button
            onClick={salvarConfiguracoes}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações de Negócio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Configurações de Negócio
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure margens e regras do seu negócio
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Margem de Lucro Padrão
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={localProfitMargin}
                      onChange={(e) => handleMargemChange(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-20 text-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {localProfitMargin}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Exemplo:</strong> Um produto comprado por R$ 10,00 será sugerido para venda por{' '}
                      <strong>R$ {((10 * (1 + localProfitMargin / 100)).toFixed(2)).replace('.', ',')}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-green-600" />
                Notificações
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure quais notificações você deseja receber
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Estoque Baixo</p>
                  <p className="text-sm text-gray-600">Notificar quando produtos estiverem com estoque baixo</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificacoes.estoqueBaixo}
                    onChange={(e) => handleNotificacaoChange('estoqueBaixo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Novos Produtos</p>
                  <p className="text-sm text-gray-600">Notificar quando novos produtos forem cadastrados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificacoes.novosProdutos}
                    onChange={(e) => handleNotificacaoChange('novosProdutos', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Relatórios</p>
                  <p className="text-sm text-gray-600">Enviar relatórios semanais por email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificacoes.relatorios}
                    onChange={(e) => handleNotificacaoChange('relatorios', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Backup */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-purple-600" />
                Backup e Segurança
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure backups automáticos dos seus dados
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Backup Automático</p>
                  <p className="text-sm text-gray-600">Fazer backup automático dos dados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backup.automatico}
                    onChange={(e) => handleBackupChange('automatico', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {backup.automatico && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência do Backup
                  </label>
                  <select
                    value={backup.frequencia}
                    onChange={(e) => handleBackupChange('frequencia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="diario">Diário</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-6">
          {/* Perfil do usuário */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-600" />
                Perfil
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-medium">MS</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Marcelo Saraiva</h3>
                <p className="text-gray-600">Administrador</p>
                <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Tema */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-yellow-600" />
                Aparência
              </h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tema
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tema"
                    value="light"
                    checked={settings.theme === 'light'}
                    onChange={toggleTheme}
                    className="mr-3"
                  />
                  <span className="text-sm">Claro</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tema"
                    value="dark"
                    checked={settings.theme === 'dark'}
                    onChange={toggleTheme}
                    className="mr-3"
                  />
                  <span className="text-sm">Escuro</span>
                </label>
              </div>
            </div>
          </div>

          {/* Informações do sistema */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Versão:</span>
                <span className="text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última atualização:</span>
                <span className="text-gray-900">Hoje</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
