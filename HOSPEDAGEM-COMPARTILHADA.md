# 🏠 Guia de Hospedagem em HostGator (Hospedagem Compartilhada)

## ⚠️ IMPORTANTE: Limitações do HostGator Compartilhado

**Atenção**: O HostGator **compartilhado tradicional** (planos básicos) **NÃO suporta aplicações Node.js** adequadamente.

### Por que não funciona bem?

1. **Sem suporte Node.js**: Planos compartilhados são feitos para PHP, HTML estático
2. **Sem acesso SSH**: Não pode executar `npm install` ou `node server.js`
3. **Sem processos persistentes**: Node.js precisa rodar 24/7
4. **Sem porta customizada**: Não pode usar porta 5000

### ✅ Soluções Alternativas

| Solução | Custo | Dificuldade | Recomendado |
|---------|-------|-------------|-------------|
| **Railway/Render** | Grátis/Pago | ⭐ Fácil | ✅ **SIM** |
| **HostGator VPS** | ~R$ 50/mês | ⭐⭐ Médio | ⚠️ Possível |
| **DigitalOcean** | ~R$ 30/mês | ⭐⭐ Médio | ✅ Sim |
| **HostGator Node.js Hosting** | Verificar | ⭐⭐ Médio | ⚠️ Se disponível |

---

## 🎯 Opção 1: HostGator VPS (Se você tem VPS)

Se você tem um **VPS do HostGator** ou acesso SSH completo, siga estas instruções:

### Estrutura de Arquivos no Servidor

```
/public_html/                          ← Diretório raiz do seu domínio
├── index.html                         ← Arquivo inicial (vem do build)
├── static/                            ← Arquivos estáticos
│   ├── css/
│   │   └── main.xxxxx.css
│   └── js/
│       └── main.xxxxx.js
├── logo-marcelo.png
├── backend/                           ← Backend Node.js
│   ├── server.js
│   ├── database.js
│   ├── routes.js
│   ├── database.sqlite
│   ├── uploads/
│   └── node_modules/
├── package.json
└── .env                               ← Variáveis de ambiente
```

### Passo a Passo

#### 1. Preparar o Build de Produção

```bash
# No seu computador local
npm run build
```

Isso cria a pasta `frontend/build/` com os arquivos otimizados.

#### 2. Fazer Upload via FTP/SFTP

**Arquivos para enviar:**
- ✅ Todo conteúdo de `frontend/build/` → `/public_html/`
- ✅ Pasta `backend/` → `/public_html/backend/`
- ✅ `package.json` (raiz) → `/public_html/package.json`
- ✅ `.env` → `/public_html/.env` (com suas configurações)

**Não enviar:**
- ❌ `node_modules/` (será instalado no servidor)
- ❌ `frontend/src/` (não é necessário em produção)
- ❌ `frontend/node_modules/`
- ❌ `.git/`

#### 3. Configurar no Servidor via SSH

```bash
# Conectar ao servidor via SSH
ssh usuario@seu-dominio.com.br

# Ir para o diretório do site
cd public_html

# Instalar dependências do backend
npm install

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Configurar variáveis de ambiente
nano .env
```

#### 4. Criar arquivo `.env`

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
REACT_APP_API_URL=https://www.estoquefacil.com.br/api
```

#### 5. Iniciar o Servidor com PM2

```bash
# Iniciar servidor
pm2 start backend/server.js --name estoque-facil

# Salvar configuração para reiniciar automaticamente
pm2 save
pm2 startup

# Verificar status
pm2 status
pm2 logs estoque-facil
```

#### 6. Configurar Nginx (se disponível)

Se você tem acesso ao Nginx, configure o proxy reverso:

```nginx
server {
    listen 80;
    server_name www.estoquefacil.com.br estoquefacil.com.br;

    # Servir arquivos estáticos do frontend
    location / {
        root /home/usuario/public_html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API Node.js
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir uploads
    location /uploads {
        alias /home/usuario/public_html/backend/uploads;
    }
}
```

---

## 🎯 Opção 2: Arquivo Inicial (index.html)

O arquivo que deve ser exibido primeiro é:

**`frontend/build/index.html`**

Este arquivo já está configurado e contém:
- ✅ HTML base
- ✅ Links para CSS e JS
- ✅ React Router configurado
- ✅ Redirecionamento para `/login` se não autenticado

### Como o HostGator identifica?

O HostGator procura por estes arquivos nesta ordem:
1. `index.html` ← **Este é o seu!**
2. `index.php`
3. `index.htm`

Basta colocar o `index.html` do build na raiz do `public_html/`.

---

## 🗄️ Banco de Dados SQLite

### ✅ Banco de Dados Está Pronto?

**SIM!** O banco de dados SQLite está configurado e pronto para receber dados.

### Localização

```
backend/database.sqlite
```

### Estrutura do Banco

O banco já possui as seguintes tabelas:
- ✅ `users` - Usuários do sistema
- ✅ `produtos` - Produtos cadastrados
- ✅ `vendas` - Histórico de vendas
- ✅ `configuracoes` - Configurações globais

### Como Funciona

1. **Primeira execução**: O arquivo `database.sqlite` é criado automaticamente
2. **Tabelas**: São criadas automaticamente pelo código em `backend/database.js`
3. **Permissões**: Certifique-se de que o servidor tem permissão de escrita na pasta `backend/`

### ⚠️ Considerações Importantes

1. **Backup**: SQLite é um arquivo único → faça backup regular!
2. **Permissões**: A pasta `backend/` precisa ter permissão de escrita (chmod 755)
3. **Concorrência**: SQLite funciona bem para até ~100 requisições simultâneas

### Backup do Banco

```bash
# Via SSH
cp backend/database.sqlite backend/database.sqlite.backup-$(date +%Y%m%d)

# Ou via FTP
# Baixe o arquivo database.sqlite regularmente
```

---

## 📋 Checklist de Deploy

### Antes de Fazer Upload

- [ ] Executar `npm run build` localmente
- [ ] Testar o build localmente com `NODE_ENV=production`
- [ ] Criar arquivo `.env` com variáveis corretas
- [ ] Verificar se `database.sqlite` existe (pode ser criado no servidor)

### Arquivos para Upload

- [ ] `frontend/build/*` → `public_html/`
- [ ] `backend/` → `public_html/backend/`
- [ ] `package.json` → `public_html/`
- [ ] `.env` → `public_html/`

### No Servidor

- [ ] Conectar via SSH
- [ ] Instalar Node.js (se não tiver): `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
- [ ] Executar `npm install` na raiz
- [ ] Verificar permissões da pasta `backend/`: `chmod 755 backend`
- [ ] Iniciar servidor com PM2
- [ ] Configurar Nginx (se disponível)
- [ ] Testar acesso: `https://www.estoquefacil.com.br`

---

## 🔧 Configuração da API em Produção

O frontend precisa saber qual é a URL da API. Atualmente está configurado assim:

```typescript
// frontend/src/services/api.ts
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
```

### Opção A: Variável de Ambiente (Recomendado)

Antes de fazer o build, configure:

```bash
# Windows PowerShell
$env:REACT_APP_API_URL="https://www.estoquefacil.com.br/api"
npm run build

# Linux/Mac
REACT_APP_API_URL=https://www.estoquefacil.com.br/api npm run build
```

### Opção B: Modificar após Build

Você pode modificar o arquivo `build/static/js/main.*.js` após o build, mas não é recomendado.

---

## 🚨 Problemas Comuns

### Erro: "Cannot GET /"

**Solução**: Verifique se o `index.html` está na raiz do `public_html/` e se o Nginx está configurado corretamente.

### Erro: "ECONNREFUSED" ao acessar API

**Solução**: 
1. Verifique se o servidor Node.js está rodando: `pm2 status`
2. Verifique se a porta está correta no `.env`
3. Verifique se o Nginx está fazendo proxy para `/api`

### Erro: "SQLITE_CANTOPEN" ou permissão negada

**Solução**:
```bash
chmod 755 backend
chmod 644 backend/database.sqlite
```

### Banco de dados não é criado

**Solução**: O banco é criado na primeira execução. Execute o servidor manualmente uma vez:
```bash
node backend/server.js
```

---

## 💡 Recomendação Final

**Para aplicações Node.js + React, recomendo fortemente:**

1. **Railway** (https://railway.app) - Grátis para começar, muito fácil
2. **Render** (https://render.com) - Grátis para começar, simples
3. **DigitalOcean** (https://www.digitalocean.com) - VPS barato, controle total

Essas plataformas são **feitas para Node.js** e você não precisa se preocupar com:
- ❌ Configuração de Nginx
- ❌ Gerenciamento de processos
- ❌ Certificados SSL
- ❌ Domínio customizado (incluído)

---

## 📞 Suporte

Se tiver problemas, verifique:
1. Logs do servidor: `pm2 logs estoque-facil`
2. Logs do Nginx: `/var/log/nginx/error.log`
3. Permissões de arquivos: `ls -la backend/`




