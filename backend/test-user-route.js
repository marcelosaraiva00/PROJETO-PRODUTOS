/**
 * TESTE ESPECÍFICO PARA A ROTA DE USUÁRIO
 * 
 * Este script testa a nova rota /api/users/me para buscar dados completos do usuário
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Função para fazer login e obter token
const loginAndGetToken = async () => {
  try {
    const response = await axios.post(`${API_BASE}/login`, {
      username: 'testuser',
      password: 'password123'
    });
    
    return response.data.token;
  } catch (error) {
    console.error('Erro no login:', error.response?.data?.error || error.message);
    return null;
  }
};

// Função para testar a rota de usuário
const testUserRoute = async () => {
  console.log('🧪 Testando rota de usuário...\n');
  
  // Fazer login
  console.log('1️⃣ Fazendo login...');
  const token = await loginAndGetToken();
  
  if (!token) {
    console.log('❌ Falha no login. Teste abortado.');
    return;
  }
  
  console.log('✅ Login realizado com sucesso');
  console.log(`   Token: ${token.substring(0, 20)}...`);
  
  // Testar rota /api/users/me
  console.log('\n2️⃣ Testando rota /api/users/me...');
  
  try {
    const response = await axios.get(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dados do usuário obtidos com sucesso!');
    console.log('\n📊 DADOS DO USUÁRIO:');
    console.log('===================');
    console.log(`ID: ${response.data.id}`);
    console.log(`Username: ${response.data.username}`);
    console.log(`Nome Completo: ${response.data.nomeCompleto || 'Não informado'}`);
    console.log(`Documento: ${response.data.documento || 'Não informado'}`);
    console.log(`Tipo Documento: ${response.data.tipoDocumento || 'Não informado'}`);
    console.log(`Data Cadastro: ${response.data.dataCadastro || 'Não informado'}`);
    
    console.log('\n🎉 Teste da rota de usuário concluído com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro ao buscar dados do usuário:', error.response?.data?.error || error.message);
  }
};

// Executar teste
testUserRoute().catch(console.error);
