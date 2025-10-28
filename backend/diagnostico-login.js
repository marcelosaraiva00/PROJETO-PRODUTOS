/**
 * TESTE DE LOGIN - DIAGNÓSTICO DE PROBLEMAS
 * 
 * Este script testa o login com diferentes usuários para identificar problemas
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Função para testar login
const testLogin = async (username, password, description) => {
  try {
    console.log(`\n🧪 Testando: ${description}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    
    const response = await axios.post(`${API_BASE}/login`, {
      username,
      password
    });
    
    console.log('   ✅ LOGIN BEM-SUCEDIDO!');
    console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
    console.log(`   User ID: ${response.data.userId}`);
    console.log(`   Username: ${response.data.username}`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log('   ❌ FALHA NO LOGIN');
    console.log(`   Erro: ${error.response?.data?.error || error.message}`);
    console.log(`   Status: ${error.response?.status || 'N/A'}`);
    
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

// Função para testar registro (se necessário)
const testRegister = async (userData, description) => {
  try {
    console.log(`\n📝 Testando registro: ${description}`);
    
    const response = await axios.post(`${API_BASE}/register`, userData);
    
    console.log('   ✅ REGISTRO BEM-SUCEDIDO!');
    console.log(`   Mensagem: ${response.data.message}`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log('   ❌ FALHA NO REGISTRO');
    console.log(`   Erro: ${error.response?.data?.error || error.message}`);
    
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

// Função principal de diagnóstico
const diagnosticarLogin = async () => {
  console.log('🔍 DIAGNÓSTICO DE PROBLEMAS DE LOGIN');
  console.log('====================================');
  
  // Verificar se o servidor está rodando
  try {
    console.log('\n1️⃣ Verificando se o servidor está rodando...');
    await axios.get(`${API_BASE.replace('/api', '')}`);
    console.log('   ✅ Servidor está rodando!');
  } catch (error) {
    console.log('   ❌ Servidor não está rodando!');
    console.log('   💡 Execute: node server.js');
    return;
  }
  
  // Testar logins conhecidos
  console.log('\n2️⃣ Testando logins conhecidos...');
  
  const testCases = [
    {
      username: 'testuser',
      password: 'password123',
      description: 'Usuário Teste (conhecido)'
    },
    {
      username: '777',
      password: 'password123',
      description: 'Usuário 777 com senha comum'
    },
    {
      username: '777',
      password: '123456',
      description: 'Usuário 777 com senha simples'
    },
    {
      username: '777',
      password: '777',
      description: 'Usuário 777 com senha igual ao username'
    },
    {
      username: 'admin',
      password: 'admin',
      description: 'Usuário admin (não existe)'
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testLogin(testCase.username, testCase.password, testCase.description);
    results.push({ ...testCase, result });
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('======================');
  
  const successfulLogins = results.filter(r => r.result.success);
  const failedLogins = results.filter(r => !r.result.success);
  
  console.log(`✅ Logins bem-sucedidos: ${successfulLogins.length}`);
  console.log(`❌ Logins falharam: ${failedLogins.length}`);
  
  if (successfulLogins.length > 0) {
    console.log('\n🎉 LOGINS FUNCIONANDO:');
    successfulLogins.forEach(login => {
      console.log(`   • ${login.username} / ${login.password}`);
    });
  }
  
  if (failedLogins.length > 0) {
    console.log('\n⚠️ LOGINS COM PROBLEMA:');
    failedLogins.forEach(login => {
      console.log(`   • ${login.username} / ${login.password} - ${login.result.error}`);
    });
  }
  
  // Sugestões
  console.log('\n💡 SUGESTÕES:');
  console.log('=============');
  
  if (successfulLogins.length === 0) {
    console.log('• Nenhum login funcionou - verifique se o banco de dados está correto');
    console.log('• Execute: node consultar-usuarios.js para ver usuários cadastrados');
  } else {
    console.log('• Use as credenciais que funcionaram no frontend');
    console.log('• Verifique se está digitando corretamente no frontend');
  }
  
  console.log('\n🔧 COMANDOS ÚTEIS:');
  console.log('==================');
  console.log('• Ver usuários: node consultar-usuarios.js');
  console.log('• Consultar banco: node consultar-banco.js');
  console.log('• Iniciar servidor: node server.js');
};

// Executar diagnóstico
diagnosticarLogin().catch(console.error);
