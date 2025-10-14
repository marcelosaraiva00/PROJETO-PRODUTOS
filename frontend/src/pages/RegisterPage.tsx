import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, User, Lock, CheckCircle, Shield, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showNotification({
        type: 'error',
        title: 'Erro no Registro',
        message: 'As senhas não coincidem.'
      });
      return;
    }

    try {
      await register({ username, password });
      showNotification({
        type: 'success',
        title: 'Registro Bem-Sucedido!',
        message: 'Sua conta foi criada. Faça login para continuar.'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Erro no Registro',
        message: 'Ocorreu um erro ao registrar. O nome de usuário pode já existir.'
      });
      console.error('Erro de registro:', error);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Fraca', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Média', color: 'bg-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 4, label: 'Forte', color: 'bg-green-500' };
    }
    return { strength: 3, label: 'Boa', color: 'bg-blue-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #7c3aed 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        minHeight: '600px'
      }}>
        
        {/* Left Section - Login Form (70%) */}
        <div style={{
          flex: '0 0 70%',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Back to Login Link */}
          <div style={{ marginBottom: '2rem' }}>
            <Link 
              to="/login" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '1'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
            >
              <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Voltar ao Login
            </Link>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              borderRadius: '20px',
              marginBottom: '1.5rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}>
              <UserPlus style={{ width: '40px', height: '40px', color: '#1e3a8a' }} />
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Criar Conta
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              margin: 0
            }}>
              Junte-se a nós e comece a gerenciar seus produtos hoje!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Username Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="username" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                Nome de Usuário
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  <User style={{ width: '20px', height: '20px', color: '#1e3a8a' }} />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    outline: 'none',
                    background: 'white',
                    color: '#1e3a8a',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  placeholder="Escolha um nome de usuário"
                  required
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  <Lock style={{ width: '20px', height: '20px', color: '#1e3a8a' }} />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    outline: 'none',
                    background: 'white',
                    color: '#1e3a8a',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  placeholder="Crie uma senha forte"
                  required
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                />
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        style={{
                          height: '4px',
                          flex: 1,
                          borderRadius: '2px',
                          backgroundColor: level <= passwordStrength.strength
                            ? passwordStrength.strength === 1 ? '#ef4444'
                            : passwordStrength.strength === 2 ? '#f59e0b'
                            : passwordStrength.strength === 3 ? '#3b82f6'
                            : '#10b981'
                            : 'rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.3s'
                        }}
                      />
                    ))}
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    margin: 0
                  }}>
                    Força da senha: <span style={{ fontWeight: '600' }}>{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="confirm-password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                Confirmar Senha
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  <Lock style={{ width: '20px', height: '20px', color: '#1e3a8a' }} />
                </div>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    outline: 'none',
                    background: 'white',
                    color: '#1e3a8a',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  placeholder="Confirme sua senha"
                  required
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                />
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                      <span style={{
                        fontSize: '12px',
                        color: '#10b981',
                        fontWeight: '600'
                      }}>Senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid #ef4444',
                        backgroundColor: 'transparent'
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        color: '#ef4444',
                        fontWeight: '600'
                      }}>Senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                color: '#1e3a8a',
                padding: '16px 24px',
                borderRadius: '12px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '1rem'
              }}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLElement).style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseDown={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #1e3a8a',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus style={{ width: '20px', height: '20px' }} />
                  Criar Conta Gratuita
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0
            }}>
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                style={{
                  fontWeight: '600',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.8'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
              >
                Fazer login
              </Link>
            </p>
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
          background: '#f8fafc' // Light background for the image section
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

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default RegisterPage;
