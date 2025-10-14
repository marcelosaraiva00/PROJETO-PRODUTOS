const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Chave secreta para JWT

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'));
    }
  }
});

// In-memory storage para produtos (em produção, usar banco de dados)
let produtos = [];

// In-memory storage para vendas
let vendas = [];

// Variável para a margem de lucro configurável
let profitMargin = 0.5; // Padrão 50%

// In-memory storage para usuários
let users = [
  // Exemplo de usuário (senha: password)
  {
    id: "user1",
    username: "testuser",
    passwordHash: "$2a$10$wT.0x/oB5Yy0n5Q1Z.Y80eGg5b4M7p.1n7Z1u2P4j8T4r8L1s5s6"
  }
];

// Função para calcular preço sugerido de venda
const calcularPrecoSugerido = (precoCompra) => {
  return precoCompra * (1 + profitMargin);
};

// Recalcular preço sugerido para produtos existentes (chamado quando profitMargin é atualizado)
const recalcularPrecosSugeridos = () => {
  produtos = produtos.map(p => ({
    ...p,
    precoSugeridoVenda: calcularPrecoSugerido(p.precoCompra)
  }));
};

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Se não houver token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Se o token não for válido
    req.user = user; // Adiciona o payload do token à requisição
    next();
  });
};

// ========== ROTAS DE AUTENTICAÇÃO ==========

// POST /api/register - Registrar novo usuário
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
    }

    if (users.find(u => u.username === username)) {
      return res.status(409).json({ error: 'Nome de usuário já existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10); // Hash da senha

    const newUser = {
      id: uuidv4(),
      username,
      passwordHash
    };

    users.push(newUser);
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// POST /api/login - Autenticar usuário e emitir JWT
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Gerar JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user.id, username: user.username }); // Retornar userId e username
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ========== ROTAS DE CONFIGURAÇÕES ==========

// As rotas de configurações também devem ser protegidas
app.get('/api/settings/profit-margin', authenticateToken, (req, res) => {
  res.json({ profitMargin });
});

app.put('/api/settings/profit-margin', authenticateToken, (req, res) => {
  try {
    const { newProfitMargin } = req.body;
    if (typeof newProfitMargin !== 'number' || newProfitMargin < 0) {
      return res.status(400).json({ error: 'Margem de lucro inválida' });
    }
    profitMargin = newProfitMargin;

    // Recalcular preço sugerido para todos os produtos existentes (de todos os usuários)
    recalcularPrecosSugeridos();

    res.json({ message: 'Margem de lucro atualizada com sucesso', profitMargin });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar margem de lucro' });
  }
});

// ========== ROTAS DE PRODUTOS ==========

// Todas as rotas de produtos devem ser protegidas e filtrar por userId
app.get('/api/produtos', authenticateToken, (req, res) => {
  try {
    res.json(produtos.filter(p => p.userId === req.user.id));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.get('/api/produtos/:id', authenticateToken, (req, res) => {
  try {
    const produto = produtos.find(p => p.id === req.params.id && p.userId === req.user.id);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para acessá-lo' });
    }
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

app.post('/api/produtos', authenticateToken, upload.single('imagem'), (req, res) => {
  try {
    const { nome, precoCompra, quantidadeComprada } = req.body;
    
    if (!nome || !precoCompra || !quantidadeComprada) {
      return res.status(400).json({ error: 'Nome, preço de compra e quantidade são obrigatórios' });
    }

    const precoSugeridoVenda = calcularPrecoSugerido(parseFloat(precoCompra));
    
    const novoProduto = {
      id: uuidv4(),
      userId: req.user.id, // Associar produto ao userId do usuário logado
      nome,
      precoCompra: parseFloat(precoCompra),
      precoSugeridoVenda,
      quantidadeComprada: parseInt(quantidadeComprada),
      quantidadeDisponivel: parseInt(quantidadeComprada),
      imagem: req.file ? req.file.filename : null,
      dataCadastro: new Date().toISOString()
    };

    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});

app.put('/api/produtos/:id', authenticateToken, upload.single('imagem'), (req, res) => {
  try {
    const produtoIndex = produtos.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
    if (produtoIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para editá-lo' });
    }

    const { nome, precoCompra, quantidadeComprada, quantidadeDisponivel } = req.body;
    
    const precoSugeridoVenda = calcularPrecoSugerido(parseFloat(precoCompra));
    
    produtos[produtoIndex] = {
      ...produtos[produtoIndex],
      nome: nome || produtos[produtoIndex].nome,
      precoCompra: precoCompra ? parseFloat(precoCompra) : produtos[produtoIndex].precoCompra,
      precoSugeridoVenda: precoCompra ? precoSugeridoVenda : produtos[produtoIndex].precoSugeridoVenda,
      quantidadeComprada: quantidadeComprada ? parseInt(quantidadeComprada) : produtos[produtoIndex].quantidadeComprada,
      quantidadeDisponivel: quantidadeDisponivel ? parseInt(quantidadeDisponivel) : produtos[produtoIndex].quantidadeDisponivel,
      imagem: req.file ? req.file.filename : produtos[produtoIndex].imagem
    };

    res.json(produtos[produtoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

app.delete('/api/produtos/:id', authenticateToken, (req, res) => {
  try {
    const produtoIndex = produtos.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
    if (produtoIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para deletá-lo' });
    }

    // Remover imagem se existir
    const produto = produtos[produtoIndex];
    if (produto.imagem) {
      const imagePath = path.join(uploadsDir, produto.imagem);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    produtos.splice(produtoIndex, 1);
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// ========== ROTAS DE VENDAS ==========

// Todas as rotas de vendas devem ser protegidas e filtrar por userId
app.get('/api/vendas', authenticateToken, (req, res) => {
  try {
    const vendasDoUsuario = vendas.filter(v => v.userId === req.user.id);
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

app.post('/api/vendas', authenticateToken, (req, res) => {
  try {
    const { produtoId, quantidadeVendida, precoVenda, observacoes } = req.body;
    
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
      userId: req.user.id, // Associar venda ao userId do usuário logado
      produtoId,
      produtoNome: produto.nome,
      quantidadeVendida: parseInt(quantidadeVendida),
      precoVenda: parseFloat(precoVenda),
      valorTotal: parseFloat(precoVenda) * parseInt(quantidadeVendida),
      dataVenda: new Date().toISOString(),
      observacoes: observacoes || ''
    };

    // Dar baixa no estoque
    produto.quantidadeDisponivel -= parseInt(quantidadeVendida);

    // Salvar venda
    vendas.push(novaVenda);

    res.status(201).json(novaVenda);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar venda' });
  }
});

app.get('/api/vendas/:id', authenticateToken, (req, res) => {
  try {
    const venda = vendas.find(v => v.id === req.params.id && v.userId === req.user.id);
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada ou você não tem permissão para acessá-la' });
    }

    // Enriquecer com dados do produto
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

app.delete('/api/vendas/:id', authenticateToken, (req, res) => {
  try {
    const vendaIndex = vendas.findIndex(v => v.id === req.params.id && v.userId === req.user.id);
    if (vendaIndex === -1) {
      return res.status(404).json({ error: 'Venda não encontrada ou você não tem permissão para cancelá-la' });
    }

    const venda = vendas[vendaIndex];
    
    // Reestocar o produto (apenas se pertencer ao usuário)
    const produto = produtos.find(p => p.id === venda.produtoId && p.userId === req.user.id);
    if (produto) {
      produto.quantidadeDisponivel += venda.quantidadeVendida;
    }

    // Remover venda
    vendas.splice(vendaIndex, 1);

    res.json({ message: 'Venda cancelada e produto reestocado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cancelar venda' });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
