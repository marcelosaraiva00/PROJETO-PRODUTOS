# 📁 Estrutura de Arquivos para HostGator

## 🎯 Resposta Direta às Suas Perguntas

### 1. Qual página deve ser exibida no começo?

**Arquivo:** `frontend/build/index.html`

Este arquivo **JÁ ESTÁ PRONTO** e deve ser colocado na **raiz** do seu `public_html/` no HostGator.

### 2. Como estruturar o sistema?

```
public_html/                          ← Diretório raiz do seu domínio
│
├── index.html                        ← ⭐ ESTE É O ARQUIVO INICIAL!
│   (Vem de: frontend/build/index.html)
│
├── logo-marcelo.png                  ← Logo do sistema
│   (Vem de: frontend/build/logo-marcelo.png)
│
├── static/                           ← Arquivos estáticos (CSS, JS)
│   ├── css/
│   │   └── main.0461bb10.css
│   └── js/
│       ├── main.50b7d9dd.js
│       ├── 239.0f7038f6.chunk.js
│       ├── 455.7332adb3.chunk.js
│       └── 977.9bd16181.chunk.js
│
├── backend/                          ← Backend Node.js
│   ├── server.js                     ← Servidor principal
│   ├── database.js                   ← Configuração do banco
│   ├── routes.js                     ← Rotas da API
│   ├── database.sqlite               ← ⭐ Banco de dados (será criado se não existir)
│   ├── uploads/                      ← Imagens dos produtos
│   │   └── (pasta vazia inicialmente)
│   └── node_modules/                 ← (instalar via npm install)
│
├── package.json                      ← Dependências do projeto
├── .env                              ← Variáveis de ambiente (criar)
└── .htaccess                         ← Configuração Apache (opcional)
```

### 3. O banco de dados está pronto para receber dados?

**✅ SIM!** O banco de dados está configurado e pronto.

#### O que acontece:

1. **Primeira vez que o servidor roda:**
   - O arquivo `backend/database.sqlite` é **criado automaticamente**
   - Todas as tabelas são **criadas automaticamente**
   - Banco está **pronto para uso**

2. **Estrutura do banco:**
   ```
   ✅ users          - Usuários (login, cadastro, bloqueio)
   ✅ produtos       - Produtos cadastrados
   ✅ vendas         - Histórico de vendas
   ✅ configuracoes  - Configurações do sistema
   ```

3. **Não precisa fazer nada:**
   - ❌ Não precisa criar manualmente
   - ❌ Não precisa importar SQL
   - ❌ Não precisa configurar nada
   - ✅ Tudo é automático!

---

## 📤 Passo a Passo: O que Enviar para o HostGator

### Passo 1: Gerar o Build

No seu computador:
```bash
cd C:\Users\marcelo.saraiva\Desktop\PROJETO-PRODUTOS
npm run build
```

Isso cria a pasta `frontend/build/` com todos os arquivos otimizados.

### Passo 2: Estrutura de Upload via FTP

#### 📁 Opção A: Estrutura Simples (Recomendado)

```
public_html/
├── index.html                    ← Copiar de: frontend/build/index.html
├── logo-marcelo.png              ← Copiar de: frontend/build/logo-marcelo.png
├── static/                       ← Copiar pasta inteira de: frontend/build/static/
│   ├── css/
│   └── js/
├── backend/                      ← Copiar pasta inteira: backend/
│   ├── server.js
│   ├── database.js
│   ├── routes.js
│   └── uploads/                  ← Criar pasta vazia
└── package.json                  ← Copiar da raiz do projeto
```

#### 📁 Opção B: Estrutura Completa

Se preferir manter tudo organizado:
```
public_html/
├── index.html
├── logo-marcelo.png
├── static/
├── backend/
└── package.json
```

### Passo 3: Arquivos para NÃO Enviar

❌ **NÃO envie:**
- `node_modules/` (instalar no servidor)
- `frontend/src/` (código fonte, não precisa)
- `frontend/node_modules/`
- `.git/`
- `backend/database.sqlite` (será criado automaticamente)
- Arquivos de teste (`.test.js`, `test-*.js`)

### Passo 4: Criar arquivo `.env` no servidor

Via FTP ou SSH, crie o arquivo `.env` na raiz do `public_html/`:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456
REACT_APP_API_URL=https://www.estoquefacil.com.br/api
```

**⚠️ IMPORTANTE:** Troque `sua_chave_secreta_muito_segura_aqui_123456` por uma chave aleatória e segura!

---

## 🔍 Detalhamento do Arquivo Inicial

### `index.html` - O que ele faz?

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>Sistema de Produtos</title>
  <!-- CSS e JS são carregados automaticamente -->
</head>
<body>
  <div id="root"></div>  ← React renderiza aqui!
  <script src="/static/js/main.50b7d9dd.js"></script>
</body>
</html>
```

**Como funciona:**
1. Usuário acessa: `https://www.estoquefacil.com.br`
2. HostGator serve: `index.html`
3. HTML carrega JavaScript do React
4. React verifica se está autenticado
5. Se não estiver → Redireciona para `/login`
6. Se estiver → Mostra Dashboard

**Tudo automático!** ✅

---

## 🗄️ Banco de Dados SQLite - Detalhes

### Localização no Servidor

```
public_html/backend/database.sqlite
```

### Como é Criado

Quando o servidor Node.js inicia pela primeira vez:

```javascript
// backend/database.js
const initDatabase = () => {
  // 1. Cria arquivo database.sqlite (se não existir)
  // 2. Cria todas as tabelas automaticamente
  // 3. Pronto para usar!
}
```

### Tabelas Criadas Automaticamente

#### 1. `users` - Usuários
```sql
- id, username, passwordHash
- nomeCompleto, documento, tipoDocumento
- isAdmin, isApproved, isBlocked
- blockReason, blockedAt
- dataCadastro, createdAt
```

#### 2. `produtos` - Produtos
```sql
- id, userId, nome
- precoCompra, precoSugeridoVenda
- quantidadeComprada, quantidadeDisponivel
- imagem, dataCadastro
```

#### 3. `vendas` - Vendas
```sql
- id, userId, produtoId
- produtoNome, quantidadeVendida
- precoVenda, valorTotal
- dataVenda, observacoes
```

#### 4. `configuracoes` - Configurações
```sql
- id, chave, valor, descricao
- (ex: margem_lucro_global = "30")
```

### Permissões Necessárias

A pasta `backend/` precisa ter permissão de escrita:

```bash
# Via SSH (se tiver acesso)
chmod 755 backend
chmod 644 backend/database.sqlite
```

### Backup

**⚠️ IMPORTANTE:** Faça backup regular do `database.sqlite`!

```bash
# Via FTP: Baixar o arquivo database.sqlite
# Via SSH:
cp backend/database.sqlite backend/backup-$(date +%Y%m%d).sqlite
```

---

## 📋 Checklist Rápido

### ✅ Preparação Local
- [ ] Executar `npm run build`
- [ ] Verificar se `frontend/build/index.html` existe
- [ ] Criar arquivo `.env` com configurações

### ✅ Upload para HostGator
- [ ] Enviar `frontend/build/index.html` → `public_html/index.html`
- [ ] Enviar `frontend/build/static/` → `public_html/static/`
- [ ] Enviar `frontend/build/logo-marcelo.png` → `public_html/logo-marcelo.png`
- [ ] Enviar `backend/` → `public_html/backend/`
- [ ] Enviar `package.json` → `public_html/package.json`
- [ ] Criar `.env` no servidor

### ✅ Configuração no Servidor
- [ ] Instalar Node.js (se não tiver)
- [ ] Executar `npm install`
- [ ] Criar pasta `backend/uploads/` (se não existir)
- [ ] Configurar permissões
- [ ] Iniciar servidor com PM2

### ✅ Teste
- [ ] Acessar: `https://www.estoquefacil.com.br`
- [ ] Verificar se aparece tela de login
- [ ] Testar cadastro de usuário
- [ ] Testar login
- [ ] Verificar se banco de dados está funcionando

---

## 🎯 Resumo

| Pergunta | Resposta |
|----------|----------|
| **Qual arquivo inicial?** | `frontend/build/index.html` → `public_html/index.html` |
| **Banco pronto?** | ✅ Sim, criado automaticamente na primeira execução |
| **Estrutura?** | `public_html/` contém: `index.html`, `static/`, `backend/` |
| **Precisa criar banco manualmente?** | ❌ Não, é automático! |
| **O que enviar?** | Build do frontend + backend + package.json |

---

## 💡 Dica Final

Se você **não tem VPS** ou acesso SSH, considere usar **Railway** ou **Render** (veja `COMO-FAZER-DEPLOY.md`). Essas plataformas são muito mais fáceis para aplicações Node.js!




