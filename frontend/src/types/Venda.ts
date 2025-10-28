/**
 * DEFINIÇÕES DE TIPOS PARA VENDAS
 * 
 * Este arquivo contém todas as interfaces relacionadas às vendas do sistema,
 * incluindo estruturas para criação, exibição e relacionamento com produtos.
 */

/**
 * Interface principal para uma venda no sistema
 * Representa uma venda completa com todas as suas propriedades
 */
export interface Venda {
  id: string;              // Identificador único da venda
  produtoId: string;       // ID do produto vendido
  produtoNome: string;     // Nome do produto (para facilitar exibição)
  quantidadeVendida: number; // Quantidade vendida
  precoVenda: number;      // Preço unitário de venda
  valorTotal: number;      // Valor total da venda (quantidade × preço)
  dataVenda: string;       // Data da venda no formato ISO
  observacoes?: string;    // Observações adicionais (opcional)
}

/**
 * Interface para criação de novas vendas
 * Usada nos formulários de registro de vendas
 */
export interface NovaVenda {
  produtoId: string;       // ID do produto a ser vendido (obrigatório)
  quantidadeVendida: number; // Quantidade a ser vendida (obrigatório)
  precoVenda: number;      // Preço de venda (obrigatório)
  observacoes?: string;    // Observações adicionais (opcional)
}

/**
 * Interface para vendas com informações completas do produto
 * Usada quando é necessário exibir dados tanto da venda quanto do produto
 */
export interface VendaComProduto extends Venda {
  produto: {
    id: string;                    // ID do produto
    nome: string;                  // Nome do produto
    precoCompra: number;          // Preço de compra do produto
    quantidadeDisponivel: number; // Quantidade disponível em estoque
    imagem?: string;              // Nome do arquivo de imagem (opcional)
  };
}
