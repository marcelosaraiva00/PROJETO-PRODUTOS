/**
 * TESTE DIRETO DA ROTA DE LOGIN
 */

const axios = require('axios');

const testLoginDirect = async () => {
  try {
    console.log('🧪 Testando rota de login diretamente...');
    
    const response = await axios.post('http://localhost:5000/api/login', {
      username: 'testuser',
      password: 'password123'
    });
    
    console.log('✅ LOGIN FUNCIONANDO!');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    console.log('User ID:', response.data.userId);
    console.log('Username:', response.data.username);
    
  } catch (error) {
    console.log('❌ ERRO NO LOGIN:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.log('Dados da resposta:', error.response.data);
    }
  }
};

testLoginDirect();
