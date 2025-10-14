export interface Venda {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidadeVendida: number;
  precoVenda: number;
  valorTotal: number;
  dataVenda: string;
  observacoes?: string;
}

export interface NovaVenda {
  produtoId: string;
  quantidadeVendida: number;
  precoVenda: number;
  observacoes?: string;
}

export interface VendaComProduto extends Venda {
  produto: {
    id: string;
    nome: string;
    precoCompra: number;
    quantidadeDisponivel: number;
    imagem?: string;
  };
}
