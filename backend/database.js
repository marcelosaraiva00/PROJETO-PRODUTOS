/**
 * CONFIGURAÇÃO E GERENCIAMENTO DO BANCO DE DADOS SQLITE
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
              resolve();
            }
          }
        }
      );
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
  getOneQuery
};
