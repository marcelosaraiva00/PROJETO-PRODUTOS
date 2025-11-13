# Estoque Fácil

Um sistema completo de gestão de estoque e produtos com controle de vendas, preços e banco de dados SQLite.

## 🌐 Deploy Online

**Quer deixar a aplicação online?** Veja os guias completos:
- 📖 [COMO-FAZER-DEPLOY.md](COMO-FAZER-DEPLOY.md) - Guia simplificado em português
- 📚 [DEPLOY.md](DEPLOY.md) - Documentação técnica completa
- 🌐 [DOMINIO-CUSTOMIZADO.md](DOMINIO-CUSTOMIZADO.md) - Como configurar domínio (estoquefacil.com.br)
- 🏠 [HOSPEDAGEM-COMPARTILHADA.md](HOSPEDAGEM-COMPARTILHADA.md) - Guia para HostGator e hospedagem compartilhada
- 📁 [ESTRUTURA-HOSTGATOR.md](ESTRUTURA-HOSTGATOR.md) - Estrutura de arquivos e qual página exibir

**Plataformas recomendadas:** Railway, Render, ou VPS (DigitalOcean)

**⚠️ HostGator Compartilhado:** Não suporta Node.js. Use VPS ou plataformas como Railway/Render.

## 🚀 Funcionalidades

### ✅ Gestão de Produtos
- Cadastro de produtos com nome, preço de compra e quantidade
- Upload de fotos dos produtos
- Cálculo automático de preço sugerido de venda (margem configurável)
- Edição e exclusão de produtos

### ✅ Controle de Estoque
- Controle de quantidade comprada vs disponível
- Alertas de estoque baixo
- Histórico de movimentações

### ✅ Sistema de Vendas
- Registro de vendas com produtos específicos
- Controle automático de estoque após vendas
- Histórico completo de vendas
- Cancelamento de vendas com reestocagem

### ✅ Autenticação e Segurança
- Sistema de login e registro
- Autenticação JWT
- Dados de usuário com CPF/CNPJ
- Controle de acesso por usuário

### ✅ Banco de Dados
- SQLite para persistência de dados
- Dados não são perdidos ao reiniciar servidor
- Backup automático do arquivo de banco

### ✅ Interface Moderna
- Design responsivo (desktop, tablet, mobile)
- Interface intuitiva e moderna
- Dashboard com estatísticas
- Busca e filtros avançados

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite3** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **Multer** - Upload de arquivos
- **UUID** - Geração de IDs únicos

### Frontend
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **React Router** - Navegação

## 📦 Como Instalar e Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Instalar dependências

```bash
# Instalar todas as dependências (backend + frontend)
npm run install-all
```

Ou manualmente:

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

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Estrutura do Projeto

```
estoque-facil/
├── backend/
│   ├── server.js              # Servidor Express principal
│   ├── database.js            # Configuração do SQLite
│   ├── routes.js              # Rotas de produtos e vendas
│   ├── database.sqlite        # Arquivo do banco de dados
│   └── uploads/               # Diretório de imagens
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── context/           # Contextos (Auth, Settings, etc.)
│   │   ├── services/          # Serviços de API
│   │   ├── types/             # Tipos TypeScript
│   │   └── App.tsx            # Componente principal
│   └── package.json
├── package.json               # Dependências do projeto
└── README.md
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/register` - Registrar novo usuário
- `POST /api/login` - Fazer login
- `GET /api/users/me` - Obter dados do usuário atual

### Produtos
- `GET /api/produtos` - Listar produtos do usuário
- `GET /api/produtos/:id` - Buscar produto por ID
- `POST /api/produtos` - Cadastrar novo produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

### Vendas
- `GET /api/vendas` - Listar vendas do usuário
- `GET /api/vendas/:id` - Buscar venda por ID
- `POST /api/vendas` - Registrar nova venda
- `DELETE /api/vendas/:id` - Cancelar venda

### Configurações
- `GET /api/settings/profit-margin` - Obter margem de lucro
- `PUT /api/settings/profit-margin` - Atualizar margem de lucro

## 💾 Banco de Dados

### Tabelas
- **users** - Usuários do sistema
- **produtos** - Produtos cadastrados
- **vendas** - Histórico de vendas
- **configuracoes** - Configurações globais

### Persistência
- Dados salvos em `backend/database.sqlite`
- Arquivo pode ser copiado para backup
- Dados persistem após reinicialização do servidor

## 🎯 Como Usar

### 1. Primeiro Acesso
1. Acesse http://localhost:3000
2. Clique em "Registrar" para criar uma conta
3. Preencha: nome completo, CPF/CNPJ, username e senha
4. Faça login com suas credenciais

### 2. Cadastrar Produtos
1. Vá para "Produtos" → "Adicionar Produto"
2. Preencha: nome, preço de compra, quantidade
3. Adicione uma foto (opcional)
4. O sistema calcula automaticamente o preço sugerido

### 3. Registrar Vendas
1. Vá para "Vendas" → "Nova Venda"
2. Selecione o produto
3. Informe quantidade e preço de venda
4. O estoque é atualizado automaticamente

### 4. Configurações
1. Acesse "Configurações"
2. Ajuste a margem de lucro padrão
3. Configure notificações e backup
4. Visualize informações do seu perfil

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento (backend + frontend)
npm run dev

# Apenas backend
npm run server

# Apenas frontend
npm run client

# Build para produção
npm run build

# Instalar todas as dependências
npm run install-all
```

## 📊 Scripts de Consulta

```bash
# Consultar dados do banco
node backend/consultar-banco.js

# Testar integração completa
node backend/test-integration.js

# Testar rota de usuário
node backend/test-user-route.js
```

## 🎨 Características do Sistema

- **Responsivo**: Funciona em todos os dispositivos
- **Seguro**: Autenticação JWT e senhas criptografadas
- **Persistente**: Dados salvos em banco SQLite
- **Intuitivo**: Interface moderna e fácil de usar
- **Escalável**: Suporta múltiplos usuários
- **Confiável**: Validações e tratamento de erros

## 🚀 Próximas Funcionalidades

- [ ] Relatórios avançados
- [ ] Sistema de categorias
- [ ] Código de barras
- [ ] Notificações push
- [ ] Backup automático
- [ ] Integração com APIs externas
- [ ] App mobile
- [ ] Dashboard em tempo real

## 👨‍💻 Desenvolvido por

**Marcelo Saraiva** - Sistema completo de gestão de estoque

## 📄 Licença

MIT License - Veja o arquivo LICENSE para detalhes