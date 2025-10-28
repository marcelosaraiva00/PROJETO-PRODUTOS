/**
 * CONSULTAR ADMINISTRADORES
 */

const { initDatabase, getQuery } = require('./database');

const consultarAdministradores = async () => {
  try {
    await initDatabase();
    
    const admins = await getQuery(`
      SELECT 
        id, username, nomeCompleto, documento, tipoDocumento, 
        isAdmin, isApproved, dataCadastro
      FROM users 
      WHERE isAdmin = 1
      ORDER BY dataCadastro ASC
    `);
    
    console.log('\n👑 ADMINISTRADORES DO SISTEMA:');
    console.log('==============================');
    
    if (admins.length === 0) {
      console.log('❌ Nenhum administrador encontrado!');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ADMINISTRADOR: ${admin.username}`);
        console.log(`   Nome Completo: ${admin.nomeCompleto}`);
        console.log(`   Documento: ${admin.documento}`);
        console.log(`   Aprovado: ${admin.isApproved ? 'Sim' : 'Não'}`);
        console.log(`   Data Cadastro: ${admin.dataCadastro}`);
      });
      
      console.log('\n🔑 CREDENCIAIS DO ADMINISTRADOR:');
      console.log('================================');
      console.log('Username: testuser');
      console.log('Senha: password123');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
};

consultarAdministradores();
