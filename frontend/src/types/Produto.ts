/**
 * DEFINIÇÕES DE TIPOS PARA PRODUTOS
 * 
 * Este arquivo contém todas as interfaces relacionadas aos produtos do Estoque Fácil,
 * incluindo estruturas para criação, edição e exibição de produtos.
 */

/**
 * Interface principal para um produto no sistema
 * Representa um produto completo com todas as suas propriedades
 */
export interface Produto {
  id: string;                    // Identificador único do produto
  nome: string;                  // Nome do produto
  precoCompra: number;          // Preço de compra do produto
  precoSugeridoVenda: number;   // Preço sugerido calculado automaticamente
  quantidadeComprada: number;   // Quantidade total comprada
  quantidadeDisponivel: number; // Quantidade disponível em estoque
  imagem: string | null;        // Nome do arquivo de imagem (pode ser null)
  dataCadastro: string;         // Data de cadastro no formato ISO
}

/**
 * Interface para criação de novos produtos
 * Usada nos formulários de cadastro de produtos
 */
export interface NovoProduto {
  nome: string;        // Nome do produto (obrigatório)
  precoCompra: number; // Preço de compra (obrigatório)
  quantidadeComprada: number; // Quantidade comprada (obrigatório)
  imagem?: File;      // Arquivo de imagem (opcional)
}
