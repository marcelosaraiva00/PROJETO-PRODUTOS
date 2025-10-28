/**
 * CONSULTAS RÁPIDAS DO BANCO DE DADOS
 * 
 * Script simples para consultas básicas sem interface interativa
 */

const { getQuery, getOneQuery } = require('./database');

// Função para consultar usuários
const consultarUsuarios = async () => {
  try {
    const users = await getQuery(`
      SELECT 
        id, 
        username, 
        nomeCompleto, 
        tipoDocumento, 
        documento,
        dataCadastro 
      FROM users 
      ORDER BY dataCadastro DESC
    `);
    
    console.log('\n👥 USUÁRIOS CADASTRADOS:');
    console.log('========================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nomeCompleto} (${user.username})`);
      console.log(`   Documento: ${user.documento} (${user.tipoDocumento.toUpperCase()})`);
      console.log(`   Cadastrado em: ${user.dataCadastro}`);
      console.log('');
    });
    
    return users;
  } catch (error) {
    console.error('❌ Erro ao consultar usuários:', error.message);
    return [];
  }
};

// Função para consultar produtos
const consultarProdutos = async () => {
  try {
    const produtos = await getQuery(`
      SELECT 
        p.id,
        p.nome,
        p.precoCompra,
        p.precoSugeridoVenda,
        p.quantidadeComprada,
        p.quantidadeDisponivel,
        p.dataCadastro,
        u.username as usuario
      FROM produtos p 
      JOIN users u ON p.userId = u.id 
      ORDER BY p.dataCadastro DESC
    `);
    
    console.log('\n📦 PRODUTOS CADASTRADOS:');
    console.log('========================');
    produtos.forEach((produto, index) => {
      console.log(`${index + 1}. ${produto.nome}`);
      console.log(`   Preço Compra: R$ ${produto.precoCompra}`);
      console.log(`   Preço Sugerido: R$ ${produto.precoSugeridoVenda}`);
      console.log(`   Estoque: ${produto.quantidadeDisponivel}/${produto.quantidadeComprada}`);
      console.log(`   Usuário: ${produto.usuario}`);
      console.log(`   Cadastrado em: ${produto.dataCadastro}`);
      console.log('');
    });
    
    return produtos;
  } catch (error) {
    console.error('❌ Erro ao consultar produtos:', error.message);
    return [];
  }
};

// Função para consultar vendas
const consultarVendas = async () => {
  try {
    const vendas = await getQuery(`
      SELECT 
        v.id,
        v.produtoNome,
        v.quantidadeVendida,
        v.precoVenda,
        v.valorTotal,
        v.dataVenda,
        v.observacoes,
        u.username as usuario
      FROM vendas v 
      JOIN users u ON v.userId = u.id
      ORDER BY v.dataVenda DESC
    `);
    
    console.log('\n💰 VENDAS REALIZADAS:');
    console.log('====================');
    vendas.forEach((venda, index) => {
      console.log(`${index + 1}. ${venda.produtoNome}`);
      console.log(`   Quantidade: ${venda.quantidadeVendida}`);
      console.log(`   Preço Unitário: R$ ${venda.precoVenda}`);
      console.log(`   Valor Total: R$ ${venda.valorTotal}`);
      console.log(`   Data: ${venda.dataVenda}`);
      console.log(`   Usuário: ${venda.usuario}`);
      if (venda.observacoes) {
        console.log(`   Observações: ${venda.observacoes}`);
      }
      console.log('');
    });
    
    return vendas;
  } catch (error) {
    console.error('❌ Erro ao consultar vendas:', error.message);
    return [];
  }
};

// Função para estatísticas gerais
const estatisticasGerais = async () => {
  try {
    const [usersCount, produtosCount, vendasCount, config] = await Promise.all([
      getQuery('SELECT COUNT(*) as total FROM users'),
      getQuery('SELECT COUNT(*) as total FROM produtos'),
      getQuery('SELECT COUNT(*) as total FROM vendas'),
      getQuery('SELECT * FROM configuracoes')
    ]);

    console.log('\n📈 ESTATÍSTICAS GERAIS:');
    console.log('========================');
    console.log(`👥 Total de usuários: ${usersCount[0].total}`);
    console.log(`📦 Total de produtos: ${produtosCount[0].total}`);
    console.log(`💰 Total de vendas: ${vendasCount[0].total}`);
    
    if (config.length > 0) {
      console.log('\n⚙️  CONFIGURAÇÕES:');
      config.forEach(c => {
        console.log(`   ${c.chave}: ${c.valor} (${c.descricao})`);
      });
    }
    
    // Calcular valor total das vendas
    const totalVendas = await getQuery('SELECT SUM(valorTotal) as total FROM vendas');
    if (totalVendas[0].total) {
      console.log(`\n💵 Valor total das vendas: R$ ${totalVendas[0].total}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error.message);
  }
};

// Função principal
const main = async () => {
  try {
    console.log('🚀 Consultando banco de dados...');
    
    // Verificar conexão
    await getQuery('SELECT 1');
    console.log('✅ Banco de dados conectado!');
    
    // Executar todas as consultas
    await estatisticasGerais();
    await consultarUsuarios();
    await consultarProdutos();
    await consultarVendas();
    
    console.log('\n✅ Consultas concluídas!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Certifique-se de que o servidor está rodando primeiro!');
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  consultarUsuarios,
  consultarProdutos,
  consultarVendas,
  estatisticasGerais
};
