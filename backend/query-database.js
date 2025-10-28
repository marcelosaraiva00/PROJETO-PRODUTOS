/**
 * SCRIPT DE CONSULTA AO BANCO DE DADOS
 * 
 * Este script permite consultar diretamente os dados armazenados
 * no banco SQLite sem precisar usar a API.
 */

const { getDatabase, getQuery, getOneQuery } = require('./database');
const readline = require('readline');

// Interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas
const question = (query) => {
  return new Promise(resolve => rl.question(query, resolve));
};

// Função para exibir dados formatados
const displayData = (title, data) => {
  console.log(`\n📊 ${title}`);
  console.log('='.repeat(50));
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('Nenhum registro encontrado.');
    } else {
      data.forEach((item, index) => {
        console.log(`\n${index + 1}. ${JSON.stringify(item, null, 2)}`);
      });
    }
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('='.repeat(50));
};

// Menu principal
const showMenu = () => {
  console.log('\n🗄️  CONSULTAS DO BANCO DE DADOS');
  console.log('================================');
  console.log('1. Listar todos os usuários');
  console.log('2. Listar todos os produtos');
  console.log('3. Listar todas as vendas');
  console.log('4. Ver configurações');
  console.log('5. Estatísticas gerais');
  console.log('6. Consulta personalizada');
  console.log('0. Sair');
  console.log('================================');
};

// Estatísticas gerais
const showStats = async () => {
  try {
    const [users, produtos, vendas, config] = await Promise.all([
      getQuery('SELECT COUNT(*) as total FROM users'),
      getQuery('SELECT COUNT(*) as total FROM produtos'),
      getQuery('SELECT COUNT(*) as total FROM vendas'),
      getQuery('SELECT * FROM configuracoes')
    ]);

    console.log('\n📈 ESTATÍSTICAS GERAIS');
    console.log('======================');
    console.log(`👥 Total de usuários: ${users[0].total}`);
    console.log(`📦 Total de produtos: ${produtos[0].total}`);
    console.log(`💰 Total de vendas: ${vendas[0].total}`);
    console.log(`⚙️  Configurações:`);
    config.forEach(c => {
      console.log(`   - ${c.chave}: ${c.valor} (${c.descricao})`);
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error.message);
  }
};

// Consulta personalizada
const customQuery = async () => {
  try {
    console.log('\n💡 Exemplos de consultas SQL:');
    console.log('SELECT * FROM users WHERE tipoDocumento = "cpf"');
    console.log('SELECT nome, precoCompra FROM produtos WHERE userId = "user-id"');
    console.log('SELECT * FROM vendas WHERE dataVenda > "2024-01-01"');
    
    const sql = await question('\nDigite sua consulta SQL: ');
    
    if (sql.toLowerCase().includes('select')) {
      const result = await getQuery(sql);
      displayData('Resultado da Consulta', result);
    } else {
      console.log('❌ Apenas consultas SELECT são permitidas por segurança.');
    }
  } catch (error) {
    console.error('❌ Erro na consulta:', error.message);
  }
};

// Função principal
const main = async () => {
  try {
    console.log('🚀 Iniciando consultas ao banco de dados...');
    
    // Verificar se o banco está acessível
    await getQuery('SELECT 1');
    console.log('✅ Banco de dados conectado com sucesso!');
    
    while (true) {
      showMenu();
      const choice = await question('\nEscolha uma opção: ');
      
      switch (choice) {
        case '1':
          const users = await getQuery('SELECT id, username, nomeCompleto, tipoDocumento, dataCadastro FROM users');
          displayData('USUÁRIOS CADASTRADOS', users);
          break;
          
        case '2':
          const produtos = await getQuery(`
            SELECT p.*, u.username as usuario 
            FROM produtos p 
            JOIN users u ON p.userId = u.id 
            ORDER BY p.dataCadastro DESC
          `);
          displayData('PRODUTOS CADASTRADOS', produtos);
          break;
          
        case '3':
          const vendas = await getQuery(`
            SELECT v.*, u.username as usuario, p.nome as produto_nome
            FROM vendas v 
            JOIN users u ON v.userId = u.id
            JOIN produtos p ON v.produtoId = p.id
            ORDER BY v.dataVenda DESC
          `);
          displayData('VENDAS REALIZADAS', vendas);
          break;
          
        case '4':
          const configs = await getQuery('SELECT * FROM configuracoes');
          displayData('CONFIGURAÇÕES DO SISTEMA', configs);
          break;
          
        case '5':
          await showStats();
          break;
          
        case '6':
          await customQuery();
          break;
          
        case '0':
          console.log('\n👋 Encerrando consultas...');
          rl.close();
          process.exit(0);
          break;
          
        default:
          console.log('❌ Opção inválida. Tente novamente.');
      }
      
      await question('\nPressione Enter para continuar...');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error.message);
    console.log('\n💡 Certifique-se de que o servidor está rodando primeiro!');
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
