/**
 * TESTE ESPECÍFICO DO USUÁRIO 999
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testUser999 = async () => {
  try {
    console.log('🧪 Testando login do usuário 999...');
    
    const response = await axios.post(`${API_BASE}/login`, {
      username: '999',
      password: '999'
    });
    
    console.log('✅ LOGIN DO USUÁRIO 999 FUNCIONANDO!');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    console.log('User ID:', response.data.userId);
    console.log('Username:', response.data.username);
    
    // Testar busca de dados completos
    console.log('\n🔍 Buscando dados completos...');
    const userResponse = await axios.get(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    console.log('✅ Dados obtidos:');
    console.log('Nome Completo:', userResponse.data.nomeCompleto);
    console.log('Documento:', userResponse.data.documento);
    console.log('Tipo Documento:', userResponse.data.tipoDocumento);
    
  } catch (error) {
    console.log('❌ ERRO NO LOGIN DO USUÁRIO 999:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.log('Dados da resposta:', error.response.data);
    }
  }
};

// Testar todos os usuários
const testAllUsers = async () => {
  const users = [
    { username: 'testuser', password: 'password123', description: 'Usuário Teste' },
    { username: '999', password: '999', description: 'Usuário 999' },
    { username: '888', password: '888', description: 'Usuário 888' },
    { username: '777', password: '777', description: 'Usuário 777' }
  ];
  
  console.log('\n🧪 TESTANDO TODOS OS USUÁRIOS:');
  console.log('==============================');
  
  for (const user of users) {
    console.log(`\n📝 Testando ${user.description} (${user.username}/${user.password})...`);
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        username: user.username,
        password: user.password
      });
      
      console.log(`   ✅ ${user.description} - LOGIN OK!`);
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      
    } catch (error) {
      console.log(`   ❌ ${user.description} - FALHA NO LOGIN`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
    }
  }
};

// Executar testes
const runTests = async () => {
  console.log('🔍 TESTE ESPECÍFICO DO USUÁRIO 999');
  console.log('==================================');
  
  await testUser999();
  await testAllUsers();
  
  console.log('\n💡 CONCLUSÕES:');
  console.log('==============');
  console.log('• Se o usuário 999 funcionou aqui, o problema está no frontend');
  console.log('• Verifique se o frontend está rodando');
  console.log('• Verifique o console do navegador para erros');
  console.log('• Verifique se há problemas de CORS ou rede');
};

runTests();
