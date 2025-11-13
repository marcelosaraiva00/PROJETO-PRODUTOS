/**
 * ROTAS DE PRODUTOS E VENDAS DO ESTOQUE FÁCIL
 * 
 * Este arquivo contém as implementações das rotas de produtos e vendas
 * usando SQLite em vez de armazenamento em memória.
 */

const { runQuery, getQuery, getOneQuery } = require('./database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

/**
 * GET /api/produtos - Listar todos os produtos do usuário autenticado
 * Retorna apenas os produtos que pertencem ao usuário logado
 */
const listarProdutos = async (req, res) => {
  try {
    const produtos = await getQuery(
      'SELECT * FROM produtos WHERE userId = ? ORDER BY dataCadastro DESC',
      [req.user.id]
    );
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
};

/**
 * GET /api/produtos/:id - Buscar produto específico por ID
 * Retorna apenas se o produto pertencer ao usuário autenticado
 */
const buscarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await getOneQuery(
      'SELECT * FROM produtos WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

/**
 * POST /api/produtos - Cadastrar novo produto
 * Cria um novo produto com imagem opcional e calcula preço sugerido
 */
const cadastrarProduto = async (req, res) => {
  try {
    const { nome, precoCompra, quantidadeComprada, fornecedor } = req.body;
    
    // Validar campos obrigatórios
    if (!nome || !precoCompra || !quantidadeComprada) {
      return res.status(400).json({ error: 'Nome, preço de compra e quantidade são obrigatórios' });
    }

    const precoCompraNumber = parseFloat(precoCompra);
    const quantidadeCompradaNumber = parseInt(quantidadeComprada, 10);

    if (Number.isNaN(precoCompraNumber) || Number.isNaN(quantidadeCompradaNumber)) {
      return res.status(400).json({ error: 'Preço de compra e quantidade devem ser numéricos' });
    }
    
    // Obter margem de lucro atual
    const config = await getOneQuery('SELECT valor FROM configuracoes WHERE chave = ?', ['profitMargin']);
    const profitMargin = config ? parseFloat(config.valor) : 0.5;
    
    // Calcular preço sugerido
    const precoSugeridoVenda = precoCompraNumber * (1 + profitMargin);
    
    // Gerar ID único para o produto
    const produtoId = uuidv4();
    
    // Nome da imagem (se foi enviada)
    const imagem = req.file ? req.file.filename : null;
    
    // Inserir produto no banco de dados
    await runQuery(
      `INSERT INTO produtos (id, userId, nome, fornecedor, precoCompra, precoSugeridoVenda, quantidadeComprada, quantidadeDisponivel, imagem, dataCadastro) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        produtoId,
        req.user.id,
        nome,
        fornecedor ? fornecedor.trim() : null,
        precoCompraNumber,
        precoSugeridoVenda,
        quantidadeCompradaNumber,
        quantidadeCompradaNumber,
        imagem,
        new Date().toISOString()
      ]
    );
    
    // Buscar produto criado para retornar
    const novoProduto = await getOneQuery('SELECT * FROM produtos WHERE id = ?', [produtoId]);
    
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
};

/**
 * PUT /api/produtos/:id - Atualizar produto existente
 * Atualiza dados do produto e recalcula preço sugerido
 */
const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, precoCompra, quantidadeComprada, fornecedor } = req.body;
    
    // Verificar se o produto existe e pertence ao usuário
    const produtoExistente = await getOneQuery(
      'SELECT * FROM produtos WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );
    
    if (!produtoExistente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Obter margem de lucro atual
    const config = await getOneQuery('SELECT valor FROM configuracoes WHERE chave = ?', ['profitMargin']);
    const profitMargin = config ? parseFloat(config.valor) : 0.5;
    
    // Calcular novo preço sugerido
    const nomeAtualizado = nome ?? produtoExistente.nome;
    const precoCompraAtualizado = precoCompra !== undefined ? parseFloat(precoCompra) : produtoExistente.precoCompra;
    const quantidadeCompradaAtualizada = quantidadeComprada !== undefined ? parseInt(quantidadeComprada, 10) : produtoExistente.quantidadeComprada;
    const fornecedorAtualizado = fornecedor !== undefined ? (fornecedor.trim() || null) : produtoExistente.fornecedor;

    if (Number.isNaN(precoCompraAtualizado) || Number.isNaN(quantidadeCompradaAtualizada)) {
      return res.status(400).json({ error: 'Preço de compra e quantidade devem ser numéricos' });
    }

    const precoSugeridoVenda = precoCompraAtualizado * (1 + profitMargin);
    
    // Calcular nova quantidade disponível (mantém proporção)
    const proporcaoAnterior = produtoExistente.quantidadeDisponivel / produtoExistente.quantidadeComprada;
    const novaQuantidadeDisponivel = Math.floor(quantidadeCompradaAtualizada * proporcaoAnterior);
    
    // Atualizar produto no banco de dados
    await runQuery(
      `UPDATE produtos SET nome = ?, fornecedor = ?, precoCompra = ?, precoSugeridoVenda = ?, quantidadeComprada = ?, quantidadeDisponivel = ? WHERE id = ?`,
      [nomeAtualizado, fornecedorAtualizado, precoCompraAtualizado, precoSugeridoVenda, quantidadeCompradaAtualizada, novaQuantidadeDisponivel, id]
    );
    
    // Buscar produto atualizado para retornar
    const produtoAtualizado = await getOneQuery('SELECT * FROM produtos WHERE id = ?', [id]);
    
    res.json(produtoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

/**
 * DELETE /api/produtos/:id - Deletar produto
 * Remove produto e sua imagem do sistema
 */
const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o produto existe e pertence ao usuário
    const produto = await getOneQuery(
      'SELECT * FROM produtos WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Deletar imagem se existir
    if (produto.imagem) {
      const imagePath = path.join(__dirname, 'uploads', produto.imagem);
      try {
        await fs.remove(imagePath);
      } catch (error) {
        console.warn('Erro ao deletar imagem:', error.message);
      }
    }
    
    // Deletar produto do banco de dados
    await runQuery('DELETE FROM produtos WHERE id = ?', [id]);
    
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};

/**
 * GET /api/vendas - Listar todas as vendas do usuário autenticado
 * Retorna vendas com informações completas do produto
 */
const listarVendas = async (req, res) => {
  try {
    const vendas = await getQuery(
      `SELECT v.*, p.nome as produto_nome, p.precoCompra, p.quantidadeDisponivel, p.imagem 
       FROM vendas v 
       JOIN produtos p ON v.produtoId = p.id 
       WHERE v.userId = ? 
       ORDER BY v.dataVenda DESC`,
      [req.user.id]
    );
    
    // Formatar resposta para incluir dados do produto
    const vendasComProduto = vendas.map(venda => ({
      ...venda,
      produto: {
        id: venda.produtoId,
        nome: venda.produto_nome,
        precoCompra: venda.precoCompra,
        quantidadeDisponivel: venda.quantidadeDisponivel,
        imagem: venda.imagem
      }
    }));
    
    res.json(vendasComProduto);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro ao listar vendas' });
  }
};

/**
 * GET /api/vendas/:id - Buscar venda específica por ID
 * Retorna venda com informações do produto
 */
const buscarVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const venda = await getOneQuery(
      `SELECT v.*, p.nome as produto_nome, p.precoCompra, p.quantidadeDisponivel, p.imagem 
       FROM vendas v 
       JOIN produtos p ON v.produtoId = p.id 
       WHERE v.id = ? AND v.userId = ?`,
      [id, req.user.id]
    );
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    // Formatar resposta
    const vendaComProduto = {
      ...venda,
      produto: {
        id: venda.produtoId,
        nome: venda.produto_nome,
        precoCompra: venda.precoCompra,
        quantidadeDisponivel: venda.quantidadeDisponivel,
        imagem: venda.imagem
      }
    };
    
    res.json(vendaComProduto);
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro ao buscar venda' });
  }
};

/**
 * POST /api/vendas - Registrar nova venda
 * Cria venda e atualiza estoque do produto automaticamente
 */
const registrarVenda = async (req, res) => {
  try {
    const { produtoId, quantidadeVendida, precoVenda, observacoes } = req.body;
    
    // Validar campos obrigatórios
    if (!produtoId || !quantidadeVendida || !precoVenda) {
      return res.status(400).json({ error: 'Produto, quantidade e preço são obrigatórios' });
    }
    
    // Buscar produto e verificar se pertence ao usuário
    const produto = await getOneQuery(
      'SELECT * FROM produtos WHERE id = ? AND userId = ?',
      [produtoId, req.user.id]
    );
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Verificar se há estoque suficiente
    if (produto.quantidadeDisponivel < quantidadeVendida) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }
    
    // Calcular valor total da venda
    const valorTotal = quantidadeVendida * precoVenda;
    
    // Gerar ID único para a venda
    const vendaId = uuidv4();
    
    // Registrar venda no banco de dados
    await runQuery(
      `INSERT INTO vendas (id, userId, produtoId, produtoNome, quantidadeVendida, precoVenda, valorTotal, dataVenda, observacoes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendaId, req.user.id, produtoId, produto.nome, quantidadeVendida, precoVenda, valorTotal, new Date().toISOString(), observacoes]
    );
    
    // Atualizar estoque do produto
    const novaQuantidadeDisponivel = produto.quantidadeDisponivel - quantidadeVendida;
    await runQuery(
      'UPDATE produtos SET quantidadeDisponivel = ? WHERE id = ?',
      [novaQuantidadeDisponivel, produtoId]
    );
    
    // Buscar venda criada para retornar
    const novaVenda = await getOneQuery('SELECT * FROM vendas WHERE id = ?', [vendaId]);
    
    res.status(201).json(novaVenda);
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    res.status(500).json({ error: 'Erro ao registrar venda' });
  }
};

/**
 * DELETE /api/vendas/:id - Cancelar venda
 * Remove venda e reestoca o produto automaticamente
 */
const cancelarVenda = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar venda e verificar se pertence ao usuário
    const venda = await getOneQuery(
      'SELECT * FROM vendas WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    // Reestocar produto
    await runQuery(
      'UPDATE produtos SET quantidadeDisponivel = quantidadeDisponivel + ? WHERE id = ?',
      [venda.quantidadeVendida, venda.produtoId]
    );
    
    // Deletar venda do banco de dados
    await runQuery('DELETE FROM vendas WHERE id = ?', [id]);
    
    res.json({ message: 'Venda cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar venda:', error);
    res.status(500).json({ error: 'Erro ao cancelar venda' });
  }
};

module.exports = {
  listarProdutos,
  buscarProduto,
  cadastrarProduto,
  atualizarProduto,
  deletarProduto,
  listarVendas,
  buscarVenda,
  registrarVenda,
  cancelarVenda
};
