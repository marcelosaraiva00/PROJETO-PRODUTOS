/**
 * CONSULTA DETALHADA DE USUÁRIOS DO ESTOQUE FÁCIL
 * 
 * Este script mostra todos os dados dos usuários cadastrados,
 * incluindo senhas criptografadas (por segurança, não são mostradas em texto plano)
 */

const { initDatabase, getQuery } = require('./database');

// Função para consultar usuários com todos os dados
const consultarUsuariosDetalhados = async () => {
  try {
    const users = await getQuery(`
      SELECT 
        id,
        username,
        nomeCompleto,
        documento,
        tipoDocumento,
        passwordHash,
        dataCadastro,
        createdAt
      FROM users 
      ORDER BY dataCadastro DESC
    `);
    
    console.log('\n👥 USUÁRIOS CADASTRADOS - DADOS COMPLETOS:');
    console.log('==========================================');
    
    if (users.length === 0) {
      console.log('Nenhum usuário cadastrado ainda.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. USUÁRIO: ${user.username}`);
        console.log('   ──────────────────────────────────────');
        console.log(`   📋 ID: ${user.id}`);
        console.log(`   👤 Nome Completo: ${user.nomeCompleto || 'Não informado'}`);
        console.log(`   🏷️  Username: ${user.username}`);
        console.log(`   📄 Documento: ${user.documento}`);
        console.log(`   🏢 Tipo Documento: ${user.tipoDocumento.toUpperCase()}`);
        console.log(`   🔐 Senha (Hash): ${user.passwordHash}`);
        console.log(`   📅 Data Cadastro: ${user.dataCadastro}`);
        console.log(`   ⏰ Criado em: ${user.createdAt}`);
        
        // Informações sobre a senha
        console.log(`   🔒 Segurança:`);
        console.log(`      - Senha criptografada com bcrypt`);
        console.log(`      - Hash seguro (não pode ser revertido)`);
        console.log(`      - Salt automático para cada senha`);
      });
    }
    
    console.log('\n🔐 INFORMAÇÕES DE SEGURANÇA:');
    console.log('============================');
    console.log('• As senhas são criptografadas com bcrypt');
    console.log('• Cada senha tem um salt único');
    console.log('• Os hashes não podem ser revertidos para texto plano');
    console.log('• Para testar login, use as credenciais originais');
    
    console.log('\n🧪 CREDENCIAIS PARA TESTE:');
    console.log('==========================');
    console.log('Usuário 1:');
    console.log('  Username: testuser');
    console.log('  Senha: password123');
    console.log('  Nome: Usuário Teste');
    console.log('  CPF: 123.456.789-00');
    
    console.log('\nUsuário 2:');
    console.log('  Username: 777');
    console.log('  Senha: (cadastrada pelo usuário)');
    console.log('  Nome: mac');
    console.log('  CPF: 111.111.111-11');
    
  } catch (error) {
    console.error('❌ Erro ao consultar usuários:', error.message);
  }
};

// Função principal
const main = async () => {
  try {
    console.log('🚀 Consultando usuários do Estoque Fácil...');
    
    // Inicializar banco de dados
    await initDatabase();
    console.log('✅ Banco de dados conectado!');
    
    // Executar consulta detalhada
    await consultarUsuariosDetalhados();
    
    console.log('\n✅ Consulta de usuários concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { consultarUsuariosDetalhados };
