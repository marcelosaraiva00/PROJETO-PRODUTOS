import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Settings, Plane, Wrench, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(''); // Estado para mensagem de erro
  const { login, isLoading } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpar erro anterior
    
    try {
      await login({ username, password });
      showNotification({
        type: 'success',
        title: 'Login bem-sucedido!',
        message: `Bem-vindo de volta, ${username}!`
      });
    } catch (error: any) {
      // Verificar se é erro de aprovação
      if (error.response?.status === 403) {
        setError('Usuário aguardando aprovação do administrador. Entre em contato com o administrador do sistema.');
        showNotification({
          type: 'error',
          title: 'Aguardando Aprovação',
          message: 'Sua conta ainda não foi aprovada pelo administrador.'
        });
      } else {
        // Definir mensagem de erro específica para credenciais incorretas
        setError('Usuário ou senha incorretos. Verifique suas credenciais e tente novamente.');
        showNotification({
          type: 'error',
          title: 'Erro no Login',
          message: 'Usuário ou senha inválidos. Tente novamente.'
        });
      }
      console.error('Erro de login:', error);
    }
  };

  // Função para limpar erro quando o usuário digitar
  const clearError = () => {
    if (error) {
      setError('');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Section - Login Form (70%) */}
      <div style={{
        flex: '0 0 70%',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Shapes */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '16rem',
          height: '16rem',
          background: 'rgba(96, 165, 250, 0.2)',
          borderRadius: '50%',
          transform: 'translate(-8rem, -8rem)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '24rem',
          height: '24rem',
          background: 'rgba(129, 140, 248, 0.2)',
          borderRadius: '50%',
          transform: 'translate(12rem, 12rem)'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '28rem' }}>
          {/* Welcome Title */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem',
              letterSpacing: '0.1em'
            }}>
              BEM-VINDO
            </h1>
            <p style={{ color: '#dbeafe', fontSize: '1.125rem' }}>
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Username Field */}
            <div>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearError(); // Limpar erro quando digitar
                }}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  color: '#2563eb',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                placeholder="Nome de usuário"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError(); // Limpar erro quando digitar
                }}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  color: '#2563eb',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                padding: '1rem',
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: '500',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {error}
              </div>
            )}

            {/* Remember & Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '1rem',
                    height: '1rem',
                    accentColor: '#2563eb',
                    backgroundColor: 'white',
                    border: '2px solid white',
                    borderRadius: '0.25rem'
                  }}
                />
                <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>Lembrar</span>
              </label>
              <Link 
                to="#" 
                style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none' }}
                onMouseOver={(e) => (e.target as HTMLElement).style.color = '#dbeafe'}
                onMouseOut={(e) => (e.target as HTMLElement).style.color = 'white'}
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '1rem',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.5 : 1
              }}
              disabled={isLoading}
              onMouseOver={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.background = 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';
                  (e.target as HTMLElement).style.transform = 'scale(1.02)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.background = 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)';
                  (e.target as HTMLElement).style.transform = 'scale(1)';
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.75rem'
                  }}></div>
                  Entrando...
                </div>
              ) : (
                'ENTRAR'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '1rem' }}>
              Não tem uma conta?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: 'white', 
                  fontWeight: '600', 
                  textDecoration: 'underline',
                  textDecorationColor: 'white'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.color = '#dbeafe'}
                onMouseOut={(e) => (e.target as HTMLElement).style.color = 'white'}
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Logo Image (30%) */}
      <div style={{
        flex: '0 0 30%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
        background: '#f8fafc'
      }}>
        {/* Logo Image Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Placeholder for the actual image - replace with your image path */}
          <img 
            src="/logo-marcelo.png" 
            alt="Marcelo Soluções Tecnológicas"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
            onError={(e) => {
              // Fallback if image doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          
          {/* Fallback content if image is not found */}
          <div style={{
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
            borderRadius: '50%',
            color: 'white',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              Marcelo
            </div>
            <div style={{
              fontSize: '12px',
              opacity: 0.9
            }}>
              Soluções Tecnológicas
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginPage;
