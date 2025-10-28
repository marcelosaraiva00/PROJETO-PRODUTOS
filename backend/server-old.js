/**
 * SERVIDOR PRINCIPAL DO SISTEMA DE GESTÃO DE PRODUTOS E VENDAS
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

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Configuração do multer para upload de imagens
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

    // Criar novo usuário no banco de dados
    const userId = uuidv4();
    await runQuery(
      `INSERT INTO users (id, username, passwordHash, nomeCompleto, documento, tipoDocumento, dataCadastro) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, passwordHash, nomeCompleto, documento, tipoDocumento, new Date().toISOString()]
    );

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
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

    // Gerar token JWT com expiração de 1 hora
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    // Retornar token e dados do usuário
    res.json({ token, userId: user.id, username: user.username });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ========== ROTAS DE CONFIGURAÇÕES ==========

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
 * Retorna apenas os produtos que pertencem ao usuário logado
 */
app.get('/api/produtos', authenticateToken, (req, res) => {
  try {
    // Filtrar produtos pelo ID do usuário autenticado
    res.json(produtos.filter(p => p.userId === req.user.id));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

/**
 * GET /api/produtos/:id - Obter produto específico por ID
 * Retorna um produto específico se pertencer ao usuário autenticado
 */
app.get('/api/produtos/:id', authenticateToken, (req, res) => {
  try {
    // Buscar produto pelo ID e verificar se pertence ao usuário
    const produto = produtos.find(p => p.id === req.params.id && p.userId === req.user.id);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para acessá-lo' });
    }
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

/**
 * POST /api/produtos - Criar novo produto
 * Cadastra um novo produto com imagem opcional e calcula preço sugerido automaticamente
 */
app.post('/api/produtos', authenticateToken, upload.single('imagem'), (req, res) => {
  try {
    const { nome, precoCompra, quantidadeComprada } = req.body;
    
    // Validar campos obrigatórios
    if (!nome || !precoCompra || !quantidadeComprada) {
      return res.status(400).json({ error: 'Nome, preço de compra e quantidade são obrigatórios' });
    }

    // Calcular preço sugerido de venda baseado na margem de lucro
    const precoSugeridoVenda = calcularPrecoSugerido(parseFloat(precoCompra));
    
    // Criar novo produto
    const novoProduto = {
      id: uuidv4(),
      userId: req.user.id, // Associar produto ao usuário logado
      nome,
      precoCompra: parseFloat(precoCompra),
      precoSugeridoVenda,
      quantidadeComprada: parseInt(quantidadeComprada),
      quantidadeDisponivel: parseInt(quantidadeComprada), // Inicialmente igual à quantidade comprada
      imagem: req.file ? req.file.filename : null, // Nome do arquivo de imagem se fornecido
      dataCadastro: new Date().toISOString()
    };

    // Adicionar produto ao armazenamento
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});

/**
 * PUT /api/produtos/:id - Atualizar produto existente
 * Permite editar informações do produto, incluindo substituição da imagem
 */
app.put('/api/produtos/:id', authenticateToken, upload.single('imagem'), (req, res) => {
  try {
    // Buscar produto pelo ID e verificar se pertence ao usuário
    const produtoIndex = produtos.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
    if (produtoIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para editá-lo' });
    }

    const { nome, precoCompra, quantidadeComprada, quantidadeDisponivel } = req.body;
    
    // Recalcular preço sugerido se o preço de compra foi alterado
    const precoSugeridoVenda = precoCompra ? calcularPrecoSugerido(parseFloat(precoCompra)) : produtos[produtoIndex].precoSugeridoVenda;
    
    // Atualizar produto com novos dados
    produtos[produtoIndex] = {
      ...produtos[produtoIndex],
      nome: nome || produtos[produtoIndex].nome,
      precoCompra: precoCompra ? parseFloat(precoCompra) : produtos[produtoIndex].precoCompra,
      precoSugeridoVenda: precoCompra ? precoSugeridoVenda : produtos[produtoIndex].precoSugeridoVenda,
      quantidadeComprada: quantidadeComprada ? parseInt(quantidadeComprada) : produtos[produtoIndex].quantidadeComprada,
      quantidadeDisponivel: quantidadeDisponivel ? parseInt(quantidadeDisponivel) : produtos[produtoIndex].quantidadeDisponivel,
      imagem: req.file ? req.file.filename : produtos[produtoIndex].imagem // Manter imagem atual se não fornecida nova
    };

    res.json(produtos[produtoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

/**
 * DELETE /api/produtos/:id - Excluir produto
 * Remove produto do sistema e deleta arquivo de imagem associado
 */
app.delete('/api/produtos/:id', authenticateToken, (req, res) => {
  try {
    // Buscar produto pelo ID e verificar se pertence ao usuário
    const produtoIndex = produtos.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
    if (produtoIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para deletá-lo' });
    }

    const produto = produtos[produtoIndex];
    
    // Remover arquivo de imagem se existir
    if (produto.imagem) {
      const imagePath = path.join(uploadsDir, produto.imagem);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Deletar arquivo físico
      }
    }

    // Remover produto do armazenamento
    produtos.splice(produtoIndex, 1);
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// ========== ROTAS DE VENDAS ==========

/**
 * GET /api/vendas - Listar todas as vendas do usuário autenticado
 * Retorna vendas com informações completas do produto associado
 */
app.get('/api/vendas', authenticateToken, (req, res) => {
  try {
    // Filtrar vendas pelo ID do usuário autenticado
    const vendasDoUsuario = vendas.filter(v => v.userId === req.user.id);
    
    // Enriquecer vendas com dados do produto
    const vendasComProduto = vendasDoUsuario.map(venda => {
      const produto = produtos.find(p => p.id === venda.produtoId && p.userId === req.user.id);
      return {
        ...venda,
        produto: produto ? {
          id: produto.id,
          nome: produto.nome,
          precoCompra: produto.precoCompra,
          quantidadeDisponivel: produto.quantidadeDisponivel,
          imagem: produto.imagem
        } : null
      };
    });
    
    res.json(vendasComProduto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

/**
 * POST /api/vendas - Registrar nova venda
 * Cria uma nova venda e atualiza o estoque do produto automaticamente
 */
app.post('/api/vendas', authenticateToken, (req, res) => {
  try {
    const { produtoId, quantidadeVendida, precoVenda, observacoes } = req.body;
    
    // Validar campos obrigatórios
    if (!produtoId || !quantidadeVendida || !precoVenda) {
      return res.status(400).json({ error: 'Produto, quantidade e preço são obrigatórios' });
    }

    // Verificar se o produto existe e pertence ao usuário
    const produto = produtos.find(p => p.id === produtoId && p.userId === req.user.id);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para acessá-lo' });
    }

    // Verificar se há estoque suficiente
    if (produto.quantidadeDisponivel < quantidadeVendida) {
      return res.status(400).json({ 
        error: `Estoque insuficiente. Disponível: ${produto.quantidadeDisponivel}` 
      });
    }

    // Criar nova venda
    const novaVenda = {
      id: uuidv4(),
      userId: req.user.id, // Associar venda ao usuário logado
      produtoId,
      produtoNome: produto.nome,
      quantidadeVendida: parseInt(quantidadeVendida),
      precoVenda: parseFloat(precoVenda),
      valorTotal: parseFloat(precoVenda) * parseInt(quantidadeVendida),
      dataVenda: new Date().toISOString(),
      observacoes: observacoes || ''
    };

    // Dar baixa no estoque do produto
    produto.quantidadeDisponivel -= parseInt(quantidadeVendida);

    // Salvar venda no armazenamento
    vendas.push(novaVenda);

    res.status(201).json(novaVenda);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar venda' });
  }
});

/**
 * GET /api/vendas/:id - Obter venda específica por ID
 * Retorna uma venda específica com informações completas do produto
 */
app.get('/api/vendas/:id', authenticateToken, (req, res) => {
  try {
    // Buscar venda pelo ID e verificar se pertence ao usuário
    const venda = vendas.find(v => v.id === req.params.id && v.userId === req.user.id);
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada ou você não tem permissão para acessá-la' });
    }

    // Enriquecer venda com dados do produto
    const produto = produtos.find(p => p.id === venda.produtoId && p.userId === req.user.id);
    const vendaComProduto = {
      ...venda,
      produto: produto ? {
        id: produto.id,
        nome: produto.nome,
        precoCompra: produto.precoCompra,
        quantidadeDisponivel: produto.quantidadeDisponivel,
        imagem: produto.imagem
      } : null
    };

    res.json(vendaComProduto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar venda' });
  }
});

/**
 * DELETE /api/vendas/:id - Cancelar venda
 * Remove a venda e reestoca o produto automaticamente
 */
app.delete('/api/vendas/:id', authenticateToken, (req, res) => {
  try {
    // Buscar venda pelo ID e verificar se pertence ao usuário
    const vendaIndex = vendas.findIndex(v => v.id === req.params.id && v.userId === req.user.id);
    if (vendaIndex === -1) {
      return res.status(404).json({ error: 'Venda não encontrada ou você não tem permissão para cancelá-la' });
    }

    const venda = vendas[vendaIndex];
    
    // Reestocar o produto (devolver quantidade vendida ao estoque)
    const produto = produtos.find(p => p.id === venda.produtoId && p.userId === req.user.id);
    if (produto) {
      produto.quantidadeDisponivel += venda.quantidadeVendida;
    }

    // Remover venda do armazenamento
    vendas.splice(vendaIndex, 1);

    res.json({ message: 'Venda cancelada e produto reestocado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cancelar venda' });
  }
});

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
