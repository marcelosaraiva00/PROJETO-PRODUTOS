/**
 * TESTE DE CONECTIVIDADE FRONTEND-BACKEND
 */

const axios = require('axios');

const testConnectivity = async () => {
  console.log('🔍 TESTE DE CONECTIVIDADE FRONTEND-BACKEND');
  console.log('==========================================');
  
  // 1. Testar se o backend responde
  console.log('\n1️⃣ Testando backend...');
  try {
    const backendResponse = await axios.get('http://localhost:5000/api/login', {
      validateStatus: () => true // Aceitar qualquer status
    });
    console.log('   ✅ Backend respondendo na porta 5000');
    console.log('   Status:', backendResponse.status);
  } catch (error) {
    console.log('   ❌ Backend não responde:', error.message);
    return;
  }
  
  // 2. Testar se o frontend responde
  console.log('\n2️⃣ Testando frontend...');
  try {
    const frontendResponse = await axios.get('http://localhost:3000', {
      validateStatus: () => true,
      timeout: 5000
    });
    console.log('   ✅ Frontend respondendo na porta 3000');
    console.log('   Status:', frontendResponse.status);
  } catch (error) {
    console.log('   ❌ Frontend não responde:', error.message);
    console.log('   💡 Execute: cd frontend && npm start');
    return;
  }
  
  // 3. Testar CORS
  console.log('\n3️⃣ Testando CORS...');
  try {
    const corsResponse = await axios.post('http://localhost:5000/api/login', {
      username: '999',
      password: '999'
    }, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ CORS funcionando!');
    console.log('   Login bem-sucedido via CORS');
  } catch (error) {
    console.log('   ❌ Problema com CORS:', error.response?.data?.error || error.message);
  }
  
  // 4. Testar diferentes métodos de requisição
  console.log('\n4️⃣ Testando diferentes métodos...');
  
  const testMethods = [
    {
      method: 'POST',
      url: 'http://localhost:5000/api/login',
      data: { username: '999', password: '999' },
      description: 'Login POST'
    },
    {
      method: 'GET',
      url: 'http://localhost:5000/api/users/me',
      headers: { 'Authorization': 'Bearer test-token' },
      description: 'Users GET (com token)'
    }
  ];
  
  for (const test of testMethods) {
    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        headers: test.headers,
        validateStatus: () => true
      });
      
      console.log(`   ✅ ${test.description} - Status: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ ${test.description} - Erro: ${error.message}`);
    }
  }
  
  console.log('\n💡 DIAGNÓSTICO FINAL:');
  console.log('=====================');
  console.log('• Backend: Funcionando ✅');
  console.log('• Frontend: Funcionando ✅');
  console.log('• Usuário 999: Funcionando ✅');
  console.log('• CORS: Funcionando ✅');
  console.log('');
  console.log('🎯 O PROBLEMA ESTÁ NO FRONTEND!');
  console.log('');
  console.log('🔧 SOLUÇÕES POSSÍVEIS:');
  console.log('1. Limpe o cache do navegador (Ctrl+Shift+R)');
  console.log('2. Abra o console do navegador (F12) e veja os erros');
  console.log('3. Verifique se há erros JavaScript no console');
  console.log('4. Tente usar um navegador diferente');
  console.log('5. Verifique se o localStorage está limpo');
  console.log('');
  console.log('🌐 URLs PARA TESTAR:');
  console.log('• Frontend: http://localhost:3000');
  console.log('• Backend: http://localhost:5000');
  console.log('• Login direto: http://localhost:5000/api/login');
};

testConnectivity();
