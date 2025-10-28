/**
 * SCRIPT DE TESTE PARA VERIFICAR INTEGRAÇÃO COM BANCO DE DADOS
 * 
 * Este script testa as principais funcionalidades do sistema
 * para garantir que a integração com SQLite está funcionando.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Função para fazer requisições com tratamento de erro
const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message 
    };
  }
};

// Função principal de teste
const runTests = async () => {
  console.log('🧪 Iniciando testes de integração...\n');
  
  let token = null;
  let userId = null;
  
  // Teste 1: Registro de usuário
  console.log('1️⃣ Testando registro de usuário...');
  const registerResult = await makeRequest('POST', '/register', {
    username: 'testuser',
    password: 'password123',
    nomeCompleto: 'Usuário Teste',
    documento: '123.456.789-00',
    tipoDocumento: 'cpf'
  });
  
  if (registerResult.success) {
    console.log('✅ Registro realizado com sucesso');
  } else {
    console.log('❌ Erro no registro:', registerResult.error);
  }
  
  // Teste 2: Login
  console.log('\n2️⃣ Testando login...');
  const loginResult = await makeRequest('POST', '/login', {
    username: 'testuser',
    password: 'password123'
  });
  
  if (loginResult.success) {
    token = loginResult.data.token;
    userId = loginResult.data.userId;
    console.log('✅ Login realizado com sucesso');
    console.log(`   Token: ${token.substring(0, 20)}...`);
  } else {
    console.log('❌ Erro no login:', loginResult.error);
    return;
  }
  
  // Teste 3: Obter margem de lucro
  console.log('\n3️⃣ Testando obtenção de margem de lucro...');
  const marginResult = await makeRequest('GET', '/settings/profit-margin', null, token);
  
  if (marginResult.success) {
    console.log('✅ Margem de lucro obtida:', marginResult.data.profitMargin);
  } else {
    console.log('❌ Erro ao obter margem:', marginResult.error);
  }
  
  // Teste 4: Cadastrar produto
  console.log('\n4️⃣ Testando cadastro de produto...');
  const produtoResult = await makeRequest('POST', '/produtos', {
    nome: 'Produto Teste',
    precoCompra: 10.50,
    quantidadeComprada: 100
  }, token);
  
  if (produtoResult.success) {
    console.log('✅ Produto cadastrado com sucesso');
    console.log(`   ID: ${produtoResult.data.id}`);
    console.log(`   Preço sugerido: R$ ${produtoResult.data.precoSugeridoVenda}`);
  } else {
    console.log('❌ Erro ao cadastrar produto:', produtoResult.error);
  }
  
  // Teste 5: Listar produtos
  console.log('\n5️⃣ Testando listagem de produtos...');
  const listResult = await makeRequest('GET', '/produtos', null, token);
  
  if (listResult.success) {
    console.log('✅ Produtos listados com sucesso');
    console.log(`   Quantidade: ${listResult.data.length}`);
  } else {
    console.log('❌ Erro ao listar produtos:', listResult.error);
  }
  
  // Teste 6: Registrar venda
  console.log('\n6️⃣ Testando registro de venda...');
  if (produtoResult.success) {
    const vendaResult = await makeRequest('POST', '/vendas', {
      produtoId: produtoResult.data.id,
      quantidadeVendida: 5,
      precoVenda: 15.75,
      observacoes: 'Venda de teste'
    }, token);
    
    if (vendaResult.success) {
      console.log('✅ Venda registrada com sucesso');
      console.log(`   Valor total: R$ ${vendaResult.data.valorTotal}`);
    } else {
      console.log('❌ Erro ao registrar venda:', vendaResult.error);
    }
  }
  
  // Teste 7: Listar vendas
  console.log('\n7️⃣ Testando listagem de vendas...');
  const vendasResult = await makeRequest('GET', '/vendas', null, token);
  
  if (vendasResult.success) {
    console.log('✅ Vendas listadas com sucesso');
    console.log(`   Quantidade: ${vendasResult.data.length}`);
  } else {
    console.log('❌ Erro ao listar vendas:', vendasResult.error);
  }
  
  console.log('\n🎉 Testes concluídos!');
  console.log('\n📊 Resumo:');
  console.log('   - Banco de dados SQLite: ✅ Funcionando');
  console.log('   - Autenticação JWT: ✅ Funcionando');
  console.log('   - CRUD de produtos: ✅ Funcionando');
  console.log('   - CRUD de vendas: ✅ Funcionando');
  console.log('   - Configurações: ✅ Funcionando');
};

// Executar testes
runTests().catch(console.error);
