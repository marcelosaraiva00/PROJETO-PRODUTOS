# Sistema de Cadastro de Produtos

Um sistema completo para cadastro de produtos com controle de estoque, preços e upload de imagens.

## Funcionalidades

- ✅ Cadastro de produtos com nome, preço de compra e quantidade
- ✅ Cálculo automático de preço sugerido de venda (margem de 50%)
- ✅ Upload de fotos dos produtos
- ✅ Controle de estoque (quantidade comprada vs disponível)
- ✅ Interface moderna e responsiva
- ✅ Busca e filtros por produtos
- ✅ Estatísticas de estoque
- ✅ Edição e exclusão de produtos

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- Multer (upload de arquivos)
- CORS
- UUID

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Axios
- Lucide React (ícones)

## Como Instalar e Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Instalar dependências

```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd frontend
npm install
cd ..
```

### 2. Executar o sistema

```bash
# Executar backend e frontend simultaneamente
npm run dev
```

Ou executar separadamente:

```bash
# Terminal 1 - Backend (porta 5000)
npm run server

# Terminal 2 - Frontend (porta 3000)
npm run client
```

### 3. Acessar o sistema

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Estrutura do Projeto

```
sistema-produtos/
├── backend/
│   ├── server.js          # Servidor Express
│   └── uploads/           # Diretório de imagens (criado automaticamente)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # Serviços de API
│   │   ├── types/         # Tipos TypeScript
│   │   └── App.tsx        # Componente principal
│   ├── package.json
│   └── tailwind.config.js
├── package.json           # Dependências do projeto
└── README.md
```

## API Endpoints

### Produtos

- `GET /api/produtos` - Listar todos os produtos
- `GET /api/produtos/:id` - Buscar produto por ID
- `POST /api/produtos` - Cadastrar novo produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

### Upload de Imagens

- As imagens são salvas em `backend/uploads/`
- Formatos aceitos: JPEG, JPG, PNG, GIF
- Tamanho máximo: 5MB
- Acessíveis via `/uploads/nome-do-arquivo`

## Como Usar

1. **Cadastrar Produto**: Clique em "Novo Produto" e preencha os dados
2. **Upload de Foto**: Selecione uma imagem do produto (opcional)
3. **Preço Sugerido**: O sistema calcula automaticamente com 50% de margem
4. **Buscar**: Use a barra de busca para encontrar produtos
5. **Filtrar**: Filtre por nível de estoque (alto, médio, baixo)
6. **Editar**: Clique no ícone de edição em qualquer produto
7. **Excluir**: Clique no ícone de lixeira para remover um produto

## Características do Sistema

- **Responsivo**: Funciona em desktop, tablet e mobile
- **Interface Intuitiva**: Design moderno e fácil de usar
- **Validações**: Campos obrigatórios e validação de tipos
- **Feedback Visual**: Loading states e mensagens de sucesso/erro
- **Estatísticas**: Dashboard com informações resumidas
- **Gestão de Estoque**: Controle de quantidade disponível

## Desenvolvimento

Para desenvolvimento, o sistema usa:
- Hot reload no frontend (React)
- Auto-restart no backend (Nodemon)
- Proxy configurado para API calls

## Próximas Funcionalidades

- [ ] Autenticação de usuários
- [ ] Relatórios de vendas
- [ ] Integração com banco de dados
- [ ] Sistema de categorias
- [ ] Código de barras
- [ ] Notificações de estoque baixo
