export interface Produto {
  id: string;
  nome: string;
  precoCompra: number;
  precoSugeridoVenda: number;
  quantidadeComprada: number;
  quantidadeDisponivel: number;
  imagem: string | null;
  dataCadastro: string;
}

export interface NovoProduto {
  nome: string;
  precoCompra: number;
  quantidadeComprada: number;
  imagem?: File;
}
