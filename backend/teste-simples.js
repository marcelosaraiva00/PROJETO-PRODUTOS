/**
 * TESTE SIMPLES DE LOGIN
 */

const axios = require('axios');

const testSimpleLogin = async () => {
  try {
    console.log('🧪 Testando login simples...');
    
    // Testar se o servidor responde
    console.log('1️⃣ Testando conectividade...');
    try {
      const healthCheck = await axios.get('http://localhost:5000');
      console.log('   ✅ Servidor respondendo!');
    } catch (error) {
      console.log('   ❌ Servidor não responde:', error.message);
      return;
    }
    
    // Testar login
    console.log('\n2️⃣ Testando login...');
    const response = await axios.post('http://localhost:5000/api/login', {
      username: 'testuser',
      password: 'password123'
    });
    
    console.log('   ✅ LOGIN FUNCIONANDO!');
    console.log('   Token:', response.data.token.substring(0, 20) + '...');
    console.log('   User ID:', response.data.userId);
    console.log('   Username:', response.data.username);
    
  } catch (error) {
    console.log('   ❌ ERRO NO LOGIN:');
    console.log('   Status:', error.response?.status);
    console.log('   Erro:', error.response?.data?.error || error.message);
    console.log('   Dados enviados:', error.config?.data);
  }
};

testSimpleLogin();
