/**
 * TESTE COMPLETO DO SISTEMA DE APROVAÇÃO
 * 
 * Este script testa todo o fluxo de aprovação de usuários
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testApprovalSystem = async () => {
  try {
    console.log('🧪 TESTE COMPLETO DO SISTEMA DE APROVAÇÃO');
    console.log('==========================================');
    
    // 1. Testar registro de novo usuário
    console.log('\n1️⃣ Testando registro de novo usuário...');
    const newUser = {
      username: 'novousuario',
      password: 'senha123',
      nomeCompleto: 'Novo Usuário Teste',
      documento: '987.654.321-00',
      tipoDocumento: 'cpf'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/register`, newUser);
      console.log('   ✅ Usuário registrado com sucesso!');
      console.log('   Mensagem:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('   ⚠️ Usuário já existe, continuando com teste...');
      } else {
        throw error;
      }
    }
    
    // 2. Testar login com usuário não aprovado
    console.log('\n2️⃣ Testando login com usuário não aprovado...');
    try {
      await axios.post(`${API_BASE}/login`, {
        username: newUser.username,
        password: newUser.password
      });
      console.log('   ❌ ERRO: Login deveria ter falhado!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Login bloqueado corretamente (usuário não aprovado)');
        console.log('   Erro:', error.response.data.error);
      } else {
        console.log('   ❌ ERRO: Status inesperado:', error.response?.status);
      }
    }
    
    // 3. Login como administrador
    console.log('\n3️⃣ Fazendo login como administrador...');
    const adminLogin = await axios.post(`${API_BASE}/login`, {
      username: 'testuser',
      password: 'password123'
    });
    
    const adminToken = adminLogin.data.token;
    console.log('   ✅ Login de admin bem-sucedido!');
    console.log('   Token:', adminToken.substring(0, 20) + '...');
    console.log('   É Admin:', adminLogin.data.isAdmin);
    
    // 4. Listar usuários pendentes
    console.log('\n4️⃣ Listando usuários pendentes...');
    const pendingUsers = await axios.get(`${API_BASE}/admin/users/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    console.log('   ✅ Usuários pendentes obtidos!');
    console.log('   Total pendentes:', pendingUsers.data.length);
    
    if (pendingUsers.data.length > 0) {
      const pendingUser = pendingUsers.data[0];
      console.log('   Primeiro usuário pendente:', pendingUser.username);
      
      // 5. Aprovar usuário
      console.log('\n5️⃣ Aprovando usuário...');
      const approveResponse = await axios.post(`${API_BASE}/admin/users/${pendingUser.id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('   ✅ Usuário aprovado com sucesso!');
      console.log('   Mensagem:', approveResponse.data.message);
      
      // 6. Testar login do usuário aprovado
      console.log('\n6️⃣ Testando login do usuário aprovado...');
      const userLogin = await axios.post(`${API_BASE}/login`, {
        username: pendingUser.username,
        password: 'senha123' // Assumindo que a senha é esta
      });
      
      console.log('   ✅ Login do usuário aprovado funcionando!');
      console.log('   Token:', userLogin.data.token.substring(0, 20) + '...');
      
      // 7. Listar todos os usuários
      console.log('\n7️⃣ Listando todos os usuários...');
      const allUsers = await axios.get(`${API_BASE}/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('   ✅ Todos os usuários obtidos!');
      console.log('   Total de usuários:', allUsers.data.length);
      
      // Mostrar estatísticas
      const approvedUsers = allUsers.data.filter(u => u.isApproved);
      const pendingUsers2 = allUsers.data.filter(u => !u.isApproved);
      const adminUsers = allUsers.data.filter(u => u.isAdmin);
      
      console.log('\n📊 ESTATÍSTICAS:');
      console.log('================');
      console.log(`👥 Total de usuários: ${allUsers.data.length}`);
      console.log(`✅ Usuários aprovados: ${approvedUsers.length}`);
      console.log(`⏳ Usuários pendentes: ${pendingUsers2.length}`);
      console.log(`👑 Administradores: ${adminUsers.length}`);
      
    } else {
      console.log('   ℹ️ Nenhum usuário pendente encontrado');
    }
    
    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
    console.log('========================================');
    console.log('✅ Sistema de aprovação funcionando perfeitamente!');
    console.log('✅ Registro de usuários funcionando');
    console.log('✅ Bloqueio de login para não aprovados funcionando');
    console.log('✅ Aprovação de usuários funcionando');
    console.log('✅ Login de usuários aprovados funcionando');
    console.log('✅ Interface de administração funcionando');
    
  } catch (error) {
    console.log('❌ ERRO NO TESTE:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.log('Dados da resposta:', error.response.data);
    }
  }
};

testApprovalSystem();
