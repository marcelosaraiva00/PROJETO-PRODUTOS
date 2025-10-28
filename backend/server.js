/**
 * SERVIDOR PRINCIPAL DO ESTOQUE FÁCIL
 * 
 * Este arquivo contém toda a lógica do backend, incluindo:
 * - Configuração do servidor Express
 * - Middleware de autenticação JWT
 * - Rotas para produtos, vendas e configurações
 * - Upload de imagens com Multer
 * - Integração com banco de dados SQLite
 * 
 * BANCO DE DADOS: SQLite para persistência de dados
 */

// Importações das dependências necessárias
const express = require('express');           // Framework web para Node.js
const cors = require('cors');                 // Middleware para permitir requisições cross-origin
const multer = require('multer');             // Middleware para upload de arquivos
const fs = require('fs-extra');               // Utilitários para manipulação de arquivos
const path = require('path');                 // Utilitários para manipulação de caminhos
const { v4: uuidv4 } = require('uuid');       // Gerador de IDs únicos
const bcrypt = require('bcryptjs');           // Biblioteca para hash de senhas
const jwt = require('jsonwebtoken');          // Biblioteca para tokens JWT

// Importação do módulo de banco de dados
const { initDatabase, getDatabase, runQuery, getQuery, getOneQuery } = require('./database');

// Importação das rotas atualizadas
const routes = require('./routes');

// Configuração inicial do servidor
const app = express();
const PORT = process.env.PORT || 5000;        // Porta do servidor (padrão: 5000)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Chave secreta para JWT

// ========== CONFIGURAÇÃO DE MIDDLEWARE ==========

// Middleware para permitir requisições de diferentes origens (CORS)
app.use(cors());

// Middleware para processar dados JSON nas requisições
app.use(express.json());

// Middleware para servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('uploads'));

// ========== CONFIGURAÇÃO DE UPLOAD DE ARQUIVOS ==========

// Configuração do armazenamento de arquivos com Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Diretório onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    // Gerar nome único para evitar conflitos de arquivos
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// Configuração do multer com validações
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB por arquivo
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas imagens (JPEG, JPG, PNG, GIF)
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);  // Arquivo válido
    } else {
      cb(new Error('Apenas imagens são permitidas!'));  // Arquivo inválido
    }
  }
});

// ========== INICIALIZAÇÃO DO BANCO DE DADOS ==========

// Inicializar banco de dados na inicialização do servidor
let isDatabaseReady = false;

const initializeServer = async () => {
  try {
    console.log('🚀 Inicializando servidor...');
    
    // Inicializar banco de dados
    await initDatabase();
    isDatabaseReady = true;
    
    console.log('✅ Servidor inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Obter margem de lucro atual do banco de dados
 * @returns {Promise<number>} - Margem de lucro atual
 */
const getProfitMargin = async () => {
  try {
    const config = await getOneQuery('SELECT valor FROM configuracoes WHERE chave = ?', ['profitMargin']);
    return config ? parseFloat(config.valor) : 0.5;
  } catch (error) {
    console.error('Erro ao obter margem de lucro:', error);
    return 0.5; // Valor padrão
  }
};

/**
 * Atualizar margem de lucro no banco de dados
 * @param {number} newMargin - Nova margem de lucro
 */
const updateProfitMargin = async (newMargin) => {
  try {
    await runQuery(
      'UPDATE configuracoes SET valor = ?, updatedAt = CURRENT_TIMESTAMP WHERE chave = ?',
      [newMargin.toString(), 'profitMargin']
    );
  } catch (error) {
    console.error('Erro ao atualizar margem de lucro:', error);
    throw error;
  }
};

/**
 * Calcula o preço sugerido de venda baseado no preço de compra e margem de lucro
 * @param {number} precoCompra - Preço de compra do produto
 * @param {number} margin - Margem de lucro (opcional, usa a do banco se não informada)
 * @returns {Promise<number>} - Preço sugerido de venda
 */
const calcularPrecoSugerido = async (precoCompra, margin = null) => {
  const profitMargin = margin || await getProfitMargin();
  return precoCompra * (1 + profitMargin);
};

/**
 * Recalcula o preço sugerido para todos os produtos existentes
 * Chamado quando a margem de lucro é atualizada
 */
const recalcularPrecosSugeridos = async () => {
  try {
    const profitMargin = await getProfitMargin();
    await runQuery(
      'UPDATE produtos SET precoSugeridoVenda = precoCompra * (1 + ?)',
      [profitMargin]
    );
  } catch (error) {
    console.error('Erro ao recalcular preços sugeridos:', error);
    throw error;
  }
};

/**
 * Middleware para verificar e validar tokens JWT
 * Protege rotas que requerem autenticação
 */
const authenticateToken = (req, res, next) => {
  // Extrair token do header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Verificar se o token existe
  if (token == null) return res.sendStatus(401); // Não autorizado

  // Verificar se o token é válido
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token inválido
    req.user = user; // Adicionar dados do usuário à requisição
    next();
  });
};

// ========== ROTAS DE AUTENTICAÇÃO ==========

/**
 * POST /api/register - Registrar novo usuário no sistema
 * Valida os dados de entrada e cria um novo usuário com senha criptografada
 */
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nomeCompleto, documento, tipoDocumento } = req.body;

    // Validar se os campos obrigatórios foram fornecidos
    if (!username || !password || !nomeCompleto || !documento || !tipoDocumento) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Validar tipo de documento
    if (!['cpf', 'cnpj'].includes(tipoDocumento)) {
      return res.status(400).json({ error: 'Tipo de documento inválido' });
    }

    // Verificar se o nome de usuário já existe
    const existingUser = await getOneQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(409).json({ error: 'Nome de usuário já existe' });
    }

    // Verificar se o documento já existe
    const existingDocument = await getOneQuery('SELECT id FROM users WHERE documento = ?', [documento]);
    if (existingDocument) {
      return res.status(409).json({ error: `${tipoDocumento.toUpperCase()} já cadastrado` });
    }

    // Criptografar a senha usando bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar novo usuário no banco de dados (não aprovado por padrão)
    const userId = uuidv4();
    await runQuery(
      `INSERT INTO users (id, username, passwordHash, nomeCompleto, documento, tipoDocumento, dataCadastro, isApproved) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [userId, username, passwordHash, nomeCompleto, documento, tipoDocumento, new Date().toISOString()]
    );

    res.status(201).json({ 
      message: 'Usuário registrado com sucesso. Aguarde aprovação do administrador para acessar o sistema.' 
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

/**
 * POST /api/login - Autenticar usuário e emitir token JWT
 * Verifica as credenciais e retorna um token de acesso
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuário pelo nome de usuário no banco de dados
    const user = await getOneQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Verificar se a senha está correta
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Verificar se o usuário está aprovado
    if (!user.isApproved) {
      return res.status(403).json({ 
        error: 'Usuário aguardando aprovação do administrador. Entre em contato com o administrador do sistema.' 
      });
    }

    // Gerar token JWT com expiração de 1 hora
    const token = jwt.sign({ 
      id: user.id, 
      username: user.username, 
      isAdmin: user.isAdmin || false 
    }, JWT_SECRET, { expiresIn: '1h' });

    // Retornar token e dados do usuário
    res.json({ 
      token, 
      userId: user.id, 
      username: user.username,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ========== ROTAS DE USUÁRIO ==========

/**
 * GET /api/users/me - Obter dados do usuário atual
 * Retorna os dados completos do usuário autenticado
 */
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    // Buscar dados completos do usuário no banco de dados
    const user = await getOneQuery(
      'SELECT id, username, nomeCompleto, documento, tipoDocumento, dataCadastro, isAdmin, isApproved, approvedAt FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

/**
 * GET /api/settings/profit-margin - Obter margem de lucro atual
 * Retorna a margem de lucro configurada no sistema
 */
app.get('/api/settings/profit-margin', authenticateToken, async (req, res) => {
  try {
    const profitMargin = await getProfitMargin();
    res.json({ profitMargin });
  } catch (error) {
    console.error('Erro ao obter margem de lucro:', error);
    res.status(500).json({ error: 'Erro ao obter margem de lucro' });
  }
});

/**
 * PUT /api/settings/profit-margin - Atualizar margem de lucro
 * Atualiza a margem de lucro e recalcula preços sugeridos de todos os produtos
 */
app.put('/api/settings/profit-margin', authenticateToken, async (req, res) => {
  try {
    const { newProfitMargin } = req.body;
    
    // Validar se a nova margem é um número válido
    if (typeof newProfitMargin !== 'number' || newProfitMargin < 0) {
      return res.status(400).json({ error: 'Margem de lucro inválida' });
    }
    
    // Atualizar margem de lucro no banco de dados
    await updateProfitMargin(newProfitMargin);

    // Recalcular preço sugerido para todos os produtos existentes
    await recalcularPrecosSugeridos();

    res.json({ message: 'Margem de lucro atualizada com sucesso', profitMargin: newProfitMargin });
  } catch (error) {
    console.error('Erro ao atualizar margem de lucro:', error);
    res.status(500).json({ error: 'Erro ao atualizar margem de lucro' });
  }
});

// ========== ROTAS DE PRODUTOS ==========

/**
 * GET /api/produtos - Listar todos os produtos do usuário autenticado
 */
app.get('/api/produtos', authenticateToken, routes.listarProdutos);

/**
 * GET /api/produtos/:id - Buscar produto específico por ID
 */
app.get('/api/produtos/:id', authenticateToken, routes.buscarProduto);

/**
 * POST /api/produtos - Cadastrar novo produto
 */
app.post('/api/produtos', authenticateToken, upload.single('imagem'), routes.cadastrarProduto);

/**
 * PUT /api/produtos/:id - Atualizar produto existente
 */
app.put('/api/produtos/:id', authenticateToken, upload.single('imagem'), routes.atualizarProduto);

/**
 * DELETE /api/produtos/:id - Deletar produto
 */
app.delete('/api/produtos/:id', authenticateToken, routes.deletarProduto);

// ========== ROTAS DE VENDAS ==========

/**
 * GET /api/vendas - Listar todas as vendas do usuário autenticado
 */
app.get('/api/vendas', authenticateToken, routes.listarVendas);

/**
 * GET /api/vendas/:id - Buscar venda específica por ID
 */
app.get('/api/vendas/:id', authenticateToken, routes.buscarVenda);

/**
 * POST /api/vendas - Registrar nova venda
 */
app.post('/api/vendas', authenticateToken, routes.registrarVenda);

/**
 * DELETE /api/vendas/:id - Cancelar venda
 */
app.delete('/api/vendas/:id', authenticateToken, routes.cancelarVenda);

// ========== MIDDLEWARE DE TRATAMENTO DE ERROS ==========

/**
 * Middleware global para tratamento de erros
 * Captura erros específicos do Multer e outros erros gerais
 */
app.use((error, req, res, next) => {
  // Tratar erros específicos do Multer (upload de arquivos)
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB.' });
    }
  }
  
  // Tratar outros erros gerais
  res.status(500).json({ error: error.message });
});

/**
 * Middleware para verificar se o usuário é administrador
 * Deve ser usado após authenticateToken
 */
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' });
  }
  next();
};

/**
 * GET /api/admin/users/pending - Listar usuários aguardando aprovação
 * Apenas administradores podem acessar
 */
app.get('/api/admin/users/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await getQuery(
      `SELECT id, username, nomeCompleto, documento, tipoDocumento, dataCadastro, createdAt 
       FROM users 
       WHERE isApproved = 0 
       ORDER BY createdAt ASC`
    );
    
    res.json(pendingUsers);
  } catch (error) {
    console.error('Erro ao buscar usuários pendentes:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários pendentes' });
  }
});

/**
 * POST /api/admin/users/:id/approve - Aprovar usuário
 * Apenas administradores podem aprovar usuários
 */
app.post('/api/admin/users/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    // Verificar se o usuário existe e não está aprovado
    const user = await getOneQuery('SELECT * FROM users WHERE id = ? AND isApproved = 0', [id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado ou já aprovado' });
    }
    
    // Aprovar o usuário
    await runQuery(
      'UPDATE users SET isApproved = 1, approvedBy = ?, approvedAt = ? WHERE id = ?',
      [adminId, new Date().toISOString(), id]
    );
    
    res.json({ 
      message: `Usuário ${user.username} aprovado com sucesso`,
      user: {
        id: user.id,
        username: user.username,
        nomeCompleto: user.nomeCompleto
      }
    });
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    res.status(500).json({ error: 'Erro ao aprovar usuário' });
  }
});

/**
 * POST /api/admin/users/:id/reject - Rejeitar usuário
 * Apenas administradores podem rejeitar usuários
 */
app.post('/api/admin/users/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe e não está aprovado
    const user = await getOneQuery('SELECT * FROM users WHERE id = ? AND isApproved = 0', [id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado ou já aprovado' });
    }
    
    // Remover o usuário (rejeitar)
    await runQuery('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ 
      message: `Usuário ${user.username} rejeitado e removido do sistema`,
      user: {
        id: user.id,
        username: user.username,
        nomeCompleto: user.nomeCompleto
      }
    });
  } catch (error) {
    console.error('Erro ao rejeitar usuário:', error);
    res.status(500).json({ error: 'Erro ao rejeitar usuário' });
  }
});

/**
 * GET /api/admin/users - Listar todos os usuários (apenas administradores)
 */
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await getQuery(
      `SELECT id, username, nomeCompleto, documento, tipoDocumento, dataCadastro, 
              isAdmin, isApproved, approvedAt, createdAt 
       FROM users 
       ORDER BY createdAt DESC`
    );
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// ========== INICIALIZAÇÃO DO SERVIDOR ==========

/**
 * Iniciar servidor na porta configurada
 * Exibe informações de conexão no console
 */
const startServer = async () => {
  try {
    // Inicializar banco de dados primeiro
    await initializeServer();
    
    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Banco de dados SQLite conectado`);
      console.log(`🌐 Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
