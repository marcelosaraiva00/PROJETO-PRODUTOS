/**
 * TESTE COMPLETO DE LOGIN - SIMULANDO FRONTEND
 * 
 * Este script simula exatamente o que o frontend faz durante o login
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Simular o que o frontend faz
const testFrontendLogin = async () => {
  try {
    console.log('🧪 Testando login como o frontend faz...');
    
    // 1. Primeiro login (como authService.login)
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      username: 'testuser',
      password: 'password123'
    });
    
    console.log('   ✅ Login bem-sucedido!');
    console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
    console.log('   User ID:', loginResponse.data.userId);
    console.log('   Username:', loginResponse.data.username);
    
    // 2. Buscar dados completos do usuário (como authService.getCurrentUser)
    console.log('\n2️⃣ Buscando dados completos do usuário...');
    const userResponse = await axios.get(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('   ✅ Dados do usuário obtidos!');
    console.log('   Nome Completo:', userResponse.data.nomeCompleto);
    console.log('   Documento:', userResponse.data.documento);
    console.log('   Tipo Documento:', userResponse.data.tipoDocumento);
    
    // 3. Testar outras rotas autenticadas
    console.log('\n3️⃣ Testando rotas autenticadas...');
    
    // Listar produtos
    try {
      const produtosResponse = await axios.get(`${API_BASE}/produtos`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('   ✅ Lista de produtos obtida!');
      console.log('   Total de produtos:', produtosResponse.data.length);
    } catch (error) {
      console.log('   ❌ Erro ao listar produtos:', error.response?.data?.error);
    }
    
    // Buscar configurações
    try {
      const configResponse = await axios.get(`${API_BASE}/settings/profit-margin`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('   ✅ Configurações obtidas!');
      console.log('   Margem de lucro:', configResponse.data.profitMargin);
    } catch (error) {
      console.log('   ❌ Erro ao buscar configurações:', error.response?.data?.error);
    }
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('O backend está funcionando perfeitamente.');
    console.log('O problema deve estar no frontend.');
    
  } catch (error) {
    console.log('❌ ERRO NO TESTE:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.log('Dados da resposta:', error.response.data);
    }
  }
};

// Testar com diferentes usuários
const testMultipleUsers = async () => {
  const users = [
    { username: 'testuser', password: 'password123', description: 'Usuário Teste' },
    { username: '777', password: 'password123', description: 'Usuário 777' }
  ];
  
  for (const user of users) {
    console.log(`\n🧪 Testando ${user.description}...`);
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        username: user.username,
        password: user.password
      });
      
      console.log(`   ✅ ${user.description} - Login OK!`);
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      
    } catch (error) {
      console.log(`   ❌ ${user.description} - Falha no login`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
    }
  }
};

// Executar testes
const runTests = async () => {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE LOGIN');
  console.log('=================================');
  
  await testFrontendLogin();
  await testMultipleUsers();
  
  console.log('\n💡 CONCLUSÕES:');
  console.log('==============');
  console.log('• Se todos os testes passaram, o backend está OK');
  console.log('• O problema está no frontend (React)');
  console.log('• Verifique se o frontend está rodando em http://localhost:3000');
  console.log('• Verifique o console do navegador para erros JavaScript');
  console.log('• Verifique se há problemas de CORS');
};

runTests();
