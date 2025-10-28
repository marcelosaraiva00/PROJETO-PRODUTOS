/**
 * SCRIPT PARA ATUALIZAR BANCO EXISTENTE
 * 
 * Este script adiciona as colunas necessárias para o sistema de aprovação
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const updateDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Conectado ao banco de dados SQLite');
    });

    // Verificar se as colunas já existem
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      
      const hasIsAdmin = columns.some(col => col.name === 'isAdmin');
      const hasIsApproved = columns.some(col => col.name === 'isApproved');
      const hasApprovedBy = columns.some(col => col.name === 'approvedBy');
      const hasApprovedAt = columns.some(col => col.name === 'approvedAt');
      
      console.log('📊 Colunas existentes:');
      console.log('isAdmin:', hasIsAdmin);
      console.log('isApproved:', hasIsApproved);
      console.log('approvedBy:', hasApprovedBy);
      console.log('approvedAt:', hasApprovedAt);
      
      const alterQueries = [];
      
      if (!hasIsAdmin) {
        alterQueries.push('ALTER TABLE users ADD COLUMN isAdmin BOOLEAN DEFAULT 0');
      }
      
      if (!hasIsApproved) {
        alterQueries.push('ALTER TABLE users ADD COLUMN isApproved BOOLEAN DEFAULT 0');
      }
      
      if (!hasApprovedBy) {
        alterQueries.push('ALTER TABLE users ADD COLUMN approvedBy TEXT');
      }
      
      if (!hasApprovedAt) {
        alterQueries.push('ALTER TABLE users ADD COLUMN approvedAt TEXT');
      }
      
      if (alterQueries.length === 0) {
        console.log('✅ Todas as colunas já existem!');
        db.close();
        resolve();
        return;
      }
      
      console.log('\n🔧 Adicionando colunas necessárias...');
      
      let completed = 0;
      alterQueries.forEach((query, index) => {
        db.run(query, (err) => {
          if (err) {
            console.log(`❌ Erro ao executar: ${query}`);
            console.log('Erro:', err.message);
          } else {
            console.log(`✅ Coluna adicionada: ${query}`);
          }
          
          completed++;
          if (completed === alterQueries.length) {
            console.log('\n🎉 Banco de dados atualizado com sucesso!');
            db.close();
            resolve();
          }
        });
      });
    });
  });
};

updateDatabase().catch(console.error);
