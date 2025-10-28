/**
 * SCRIPT PARA TESTE NO NAVEGADOR
 * 
 * Cole este código no console do navegador (F12) para testar o login
 */

const testLoginInBrowser = () => {
  console.log('🧪 TESTE DE LOGIN NO NAVEGADOR');
  console.log('===============================');
  
  // Limpar localStorage
  localStorage.clear();
  console.log('✅ localStorage limpo');
  
  // Testar login
  fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: '999',
      password: '999'
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ LOGIN BEM-SUCEDIDO!');
    console.log('Token:', data.token.substring(0, 20) + '...');
    console.log('User ID:', data.userId);
    console.log('Username:', data.username);
    
    // Salvar no localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      username: data.username
    }));
    
    console.log('✅ Dados salvos no localStorage');
    console.log('🎉 Agora você pode usar o sistema!');
  })
  .catch(error => {
    console.log('❌ ERRO NO LOGIN:', error);
  });
};

// Executar teste
testLoginInBrowser();
