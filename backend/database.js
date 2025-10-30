/**
 * CONFIGURAÇÃO E GERENCIAMENTO DO BANCO DE DADOS SQLITE - ESTOQUE FÁCIL
 * 
 * Este arquivo contém toda a configuração do banco de dados SQLite,
 * incluindo criação de tabelas, conexão e operações básicas.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo do banco de dados
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Instância do banco de dados
let db = null;

/**
 * Inicializar conexão com o banco de dados
 * Cria o arquivo se não existir e configura as tabelas
 */
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
        reject(err);
      } else {
        console.log('✅ Conectado ao banco de dados SQLite');
        createTables()
          .then(() => resolve())
          .catch(reject);
      }
    });
  });
};

/**
 * Criar todas as tabelas necessárias
 * Define a estrutura completa do banco de dados
 */
const createTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Tabela de usuários
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        nomeCompleto TEXT NOT NULL,
        documento TEXT UNIQUE NOT NULL,
        tipoDocumento TEXT NOT NULL CHECK (tipoDocumento IN ('cpf', 'cnpj')),
        dataCadastro TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT 0,
        isApproved BOOLEAN DEFAULT 0,
        isBlocked BOOLEAN DEFAULT 0,
        blockReason TEXT,
        blockedAt TEXT,
        approvedBy TEXT,
        approvedAt TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (approvedBy) REFERENCES users (id)
      )`,
      
      // Tabela de produtos
      `CREATE TABLE IF NOT EXISTS produtos (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        nome TEXT NOT NULL,
        precoCompra REAL NOT NULL,
        precoSugeridoVenda REAL NOT NULL,
        quantidadeComprada INTEGER NOT NULL,
        quantidadeDisponivel INTEGER NOT NULL,
        imagem TEXT,
        dataCadastro TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Tabela de vendas
      `CREATE TABLE IF NOT EXISTS vendas (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        produtoId TEXT NOT NULL,
        produtoNome TEXT NOT NULL,
        quantidadeVendida INTEGER NOT NULL,
        precoVenda REAL NOT NULL,
        valorTotal REAL NOT NULL,
        dataVenda TEXT NOT NULL,
        observacoes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (produtoId) REFERENCES produtos (id) ON DELETE CASCADE
      )`,
      
      // Tabela de configurações (para margem de lucro global)
      `CREATE TABLE IF NOT EXISTS configuracoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chave TEXT UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descricao TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`Erro ao criar tabela ${index + 1}:`, err.message);
          reject(err);
        } else {
          completed++;
          console.log(`✅ Tabela ${index + 1} criada/verificada`);
          
          if (completed === total) {
            // Inserir configuração padrão de margem de lucro
            insertDefaultSettings()
              .then(() => resolve())
              .catch(reject);
          }
        }
      });
    });
  });
};

/**
 * Inserir configurações padrão do sistema
 * Define valores iniciais para configurações globais
 */
const insertDefaultSettings = () => {
  return new Promise((resolve, reject) => {
    const defaultSettings = [
      {
        chave: 'profitMargin',
        valor: '0.5',
        descricao: 'Margem de lucro padrão (50%)'
      }
    ];

    let completed = 0;
    const total = defaultSettings.length;

    defaultSettings.forEach((setting) => {
      db.run(
        `INSERT OR IGNORE INTO configuracoes (chave, valor, descricao) VALUES (?, ?, ?)`,
        [setting.chave, setting.valor, setting.descricao],
        (err) => {
          if (err) {
            console.error('Erro ao inserir configuração padrão:', err.message);
            reject(err);
          } else {
            completed++;
            if (completed === total) {
              console.log('✅ Configurações padrão inseridas');
              // Após inserir configurações, criar primeiro admin e atualizar usuários
              createFirstAdmin()
                .then(() => updateExistingUsers())
                .then(() => resolve())
                .catch(reject);
            }
          }
        }
      );
    });
  });
};

/**
 * Criar o primeiro administrador se não existir
 * Define o primeiro usuário como administrador aprovado
 */
const createFirstAdmin = () => {
  return new Promise((resolve, reject) => {
    // Verificar se já existe um administrador
    db.get('SELECT * FROM users WHERE isAdmin = 1', (err, admin) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!admin) {
        // Buscar o primeiro usuário para torná-lo administrador
        db.get('SELECT * FROM users ORDER BY createdAt ASC LIMIT 1', (err, firstUser) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (firstUser) {
            // Tornar o primeiro usuário administrador e aprovado
            db.run(
              'UPDATE users SET isAdmin = 1, isApproved = 1, approvedAt = ? WHERE id = ?',
              [new Date().toISOString(), firstUser.id],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(`✅ Primeiro administrador criado: ${firstUser.username}`);
                  resolve();
                }
              }
            );
          } else {
            resolve(); // Nenhum usuário ainda
          }
        });
      } else {
        resolve(); // Já existe administrador
      }
    });
  });
};

/**
 * Atualizar usuários existentes para incluir campos de aprovação e bloqueio
 * Adiciona campos isAdmin, isApproved, isBlocked, approvedBy, approvedAt, blockReason, blockedAt se não existirem
 */
const updateExistingUsers = () => {
  return new Promise((resolve, reject) => {
    // Verificar se os campos já existem
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      
      const hasIsAdmin = columns.some(col => col.name === 'isAdmin');
      const hasIsApproved = columns.some(col => col.name === 'isApproved');
      const hasIsBlocked = columns.some(col => col.name === 'isBlocked');
      
      // Adicionar colunas se não existirem
      const alterQueries = [];
      
      if (!hasIsAdmin) {
        alterQueries.push('ALTER TABLE users ADD COLUMN isAdmin BOOLEAN DEFAULT 0');
      }
      
      if (!hasIsApproved) {
        alterQueries.push('ALTER TABLE users ADD COLUMN isApproved BOOLEAN DEFAULT 0');
      }
      
      if (!hasIsBlocked) {
        alterQueries.push('ALTER TABLE users ADD COLUMN isBlocked BOOLEAN DEFAULT 0');
      }
      
      if (!columns.some(col => col.name === 'blockReason')) {
        alterQueries.push('ALTER TABLE users ADD COLUMN blockReason TEXT');
      }
      
      if (!columns.some(col => col.name === 'blockedAt')) {
        alterQueries.push('ALTER TABLE users ADD COLUMN blockedAt TEXT');
      }
      
      if (!columns.some(col => col.name === 'approvedBy')) {
        alterQueries.push('ALTER TABLE users ADD COLUMN approvedBy TEXT');
      }
      
      if (!columns.some(col => col.name === 'approvedAt')) {
        alterQueries.push('ALTER TABLE users ADD COLUMN approvedAt TEXT');
      }
      
      // Executar alterações
      let completed = 0;
      if (alterQueries.length === 0) {
        resolve();
        return;
      }
      
      alterQueries.forEach((query, index) => {
        db.run(query, (err) => {
          if (err) {
            console.log(`Campo já existe ou erro: ${query}`);
          } else {
            console.log(`✅ Campo adicionado: ${query}`);
          }
          
          completed++;
          if (completed === alterQueries.length) {
            resolve();
          }
        });
      });
    });
  });
};

/**
 * Obter instância do banco de dados
 * Retorna a conexão ativa com o banco
 */
const getDatabase = () => {
  if (!db) {
    throw new Error('Banco de dados não foi inicializado. Chame initDatabase() primeiro.');
  }
  return db;
};

/**
 * Fechar conexão com o banco de dados
 * Usado principalmente para testes ou shutdown da aplicação
 */
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Erro ao fechar banco de dados:', err.message);
          reject(err);
        } else {
          console.log('✅ Conexão com banco de dados fechada');
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

/**
 * Executar query SQL com parâmetros
 * Função utilitária para executar queries preparadas
 */
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

/**
 * Executar query SELECT
 * Função utilitária para consultas que retornam dados
 */
const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Executar query SELECT para um único registro
 * Função utilitária para consultas que retornam apenas um resultado
 */
const getOneQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  runQuery,
  getQuery,
  getOneQuery,
  createFirstAdmin,
  updateExistingUsers
};
