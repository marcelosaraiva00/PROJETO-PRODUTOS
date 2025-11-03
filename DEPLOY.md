# 🚀 Guia de Deploy - Estoque Fácil

Este documento descreve como deixar a aplicação Estoque Fácil online em diferentes plataformas.

## 📋 Pré-requisitos

- [ ] Conta no GitHub (repositório atualizado)
- [ ] Conta em uma plataforma de hospedagem
- [ ] Compreensão básica de Node.js e React

---

## 🌐 Opções de Hospedagem

### 🥇 Recomendado: Railway
**Vantagens:**
- ✅ Gratuito para começar (com limite)
- ✅ Fácil configuração
- ✅ Deploy automático do GitHub
- ✅ Suporta SQLite
- ✅ Sem configuração de servidor

**Preço:** Grátis até $5/mês, depois pago conforme uso

### 🥈 Alternativa: Render
**Vantagens:**
- ✅ Plano gratuito disponível
- ✅ Deploy automático
- ✅ SSL automático
- ✅ Atualizações contínuas

**Preço:** Grátis com limitações, planos a partir de $7/mês

### 🥉 Alternativa: Heroku
**Vantagens:**
- ✅ Bem estabelecido
- ✅ Boa documentação
- ⚠️ Plano gratuito removido

**Preço:** A partir de $7/mês

---

## 🚂 Deploy na Railway (Recomendado)

### Passo 1: Preparar o Projeto

1. **Instalar Railway CLI** (opcional, pode usar interface web):

```bash
npm i -g @railway/cli
railway login
```

2. **Criar arquivo de configuração Railway:**

Crie `railway.json` na raiz do projeto:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. **Criar Procfile** na raiz:

```txt
web: node backend/server.js
```

### Passo 2: Configurar Variáveis de Ambiente

No Railway, adicione as seguintes variáveis de ambiente:

```env
PORT=5000
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
NODE_ENV=production
```

### Passo 3: Deploy

**Opção A - Via Interface Web:**

1. Acesse https://railway.app
2. Faça login com GitHub
3. Clique em "New Project"
4. Escolha "Deploy from GitHub repo"
5. Selecione seu repositório
6. Railway detectará automaticamente Node.js
7. Configure as variáveis de ambiente
8. Clique em "Deploy"

**Opção B - Via CLI:**

```bash
cd seu-projeto
railway link
railway up
```

### Passo 4: Configurar Domínio

1. No Railway, vá em "Settings"
2. Clique em "Generate Domain"
3. Copie o domínio gerado
4. Seu app estará acessível em: `https://seu-app.railway.app`

### Passo 5: Atualizar Frontend

Você precisará atualizar a URL da API no frontend:

1. Railway gera uma URL para seu backend
2. No código frontend, mude `api.ts` para usar variável de ambiente
3. Build o frontend novamente

---

## 🎨 Deploy na Render

### Passo 1: Preparar Build Scripts

Edite o `package.json` na raiz, adicione:

```json
{
  "scripts": {
    "start": "node backend/server.js",
    "build": "cd frontend && npm install && npm run build"
  }
}
```

### Passo 2: Criar render.yaml

Crie `render.yaml` na raiz:

```yaml
services:
  - type: web
    name: estoque-facil
    env: node
    buildCommand: npm run install-all && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 10000
```

### Passo 3: Deploy

1. Acesse https://render.com
2. Faça login com GitHub
3. Clique em "New +" → "Web Service"
4. Conecte seu repositório
5. Render detectará automaticamente
6. Configure variáveis de ambiente
7. Clique em "Create Web Service"

---

## 🔧 Configuração de Produção

### 1. Atualizar URLs da API

Crie `frontend/.env.production`:

```env
REACT_APP_API_URL=https://seu-backend-url.com/api
```

### 2. Atualizar api.ts

Modifique `frontend/src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});
```

### 3. Build de Produção

```bash
cd frontend
npm run build
```

A pasta `frontend/build` conterá os arquivos otimizados.

---

## 📊 Deploy Backend e Frontend Separadamente

### Opção A: Backend no Railway, Frontend no Vercel

**Railway (Backend):**
- Deploys backend
- Banco SQLite
- API em https://backend-api.railway.app

**Vercel (Frontend):**
1. Vá em https://vercel.com
2. Importe repositório
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `build`
6. Adicione variável: `REACT_APP_API_URL=https://backend-api.railway.app/api`

**Vantagens:**
- ✅ Frontend super rápido (CDN global)
- ✅ Deploy automático
- ✅ Gratuito

### Opção B: Tudo em uma Máquina Virtual (VPS)

Para produção séria, considere um VPS:

**Provedores:**
- DigitalOcean ($5/mês)
- Linode ($5/mês)
- AWS EC2 (variável)
- Contabo (€4/mês)

**Passos:**

1. **Instalar Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Instalar PM2 (gerenciador de processos):**
```bash
npm install -g pm2
```

3. **Clonar repositório:**
```bash
git clone https://github.com/seu-usuario/PROJETO-PRODUTOS.git
cd PROJETO-PRODUTOS
npm run install-all
npm run build
```

4. **Configurar Nginx como proxy reverso:**

Instale Nginx:
```bash
sudo apt install nginx
```

Crie config `/etc/nginx/sites-available/estoque-facil`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend estático
    location / {
        root /caminho/para/PROJETO-PRODUTOS/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # API backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /caminho/para/PROJETO-PRODUTOS/backend/uploads;
    }
}
```

Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/estoque-facil /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. **Iniciar com PM2:**
```bash
cd PROJETO-PRODUTOS
pm2 start backend/server.js --name estoque-facil-api
pm2 save
pm2 startup
```

6. **Configurar SSL com Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] Alterar `JWT_SECRET` para uma string forte e aleatória
- [ ] Usar HTTPS (SSL)
- [ ] Configurar CORS adequadamente
- [ ] Limitar taxa de requisições (rate limiting)
- [ ] Fazer backup regular do banco SQLite
- [ ] Usar variáveis de ambiente para secrets
- [ ] Desabilitar logs sensíveis em produção
- [ ] Configurar firewall

### Melhorias Recomendadas

**1. Rate Limiting**
Adicione ao `backend/server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limita cada IP a 100 requests por windowMs
});

app.use('/api/', limiter);
```

**2. Helmet (Segurança HTTP)**
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

**3. Backup Automático**

Crie script `backend/backup.js`:

```javascript
const fs = require('fs-extra');
const path = require('path');

async function backup() {
  const dbPath = path.join(__dirname, 'database.sqlite');
  const backupDir = path.join(__dirname, 'backups');
  await fs.ensureDir(backupDir);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `database-${timestamp}.sqlite`);
  
  await fs.copy(dbPath, backupPath);
  console.log(`Backup criado: ${backupPath}`);
}

backup();
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
cd backend
npm install
cd ../frontend
npm install
```

### Erro: "Port already in use"
Mude a porta no `.env`:
```env
PORT=5001
```

### Backend não responde
Verifique logs:
```bash
# Railway
railway logs

# Render
render.com → seu-app → Logs

# VPS com PM2
pm2 logs estoque-facil-api
```

### Frontend não carrega API
Verifique variável de ambiente:
```bash
echo $REACT_APP_API_URL
```

---

## 📈 Monitoramento

### Railway
- Logs automáticos em tempo real
- Métricas de CPU/RAM
- Alertas configuráveis

### Render
- Dashboard de métricas
- Logs persistidos
- Alertas de uptime

### PM2 (VPS)
```bash
pm2 status
pm2 logs
pm2 monit
```

---

## 💰 Custos Estimados

| Plataforma | Modelo | Custo Mensal |
|------------|--------|--------------|
| Railway | Starter | $5 |
| Render | Starter | $7 |
| VPS (DigitalOcean) | Droplet 1GB | $5-6 |
| Vercel (Frontend) | Hobby | $0 |

**TOTAL Recomendado:** $5-10/mês

---

## 📞 Suporte

- Documentação Railway: https://docs.railway.app
- Documentação Render: https://render.com/docs
- Issues GitHub: https://github.com/seu-usuario/PROJETO-PRODUTOS/issues

---

## ✅ Checklist de Deploy

- [ ] Repositório GitHub atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção funcionando
- [ ] Backend deployado e respondendo
- [ ] Frontend deployado e acessível
- [ ] SSL/HTTPS configurado
- [ ] Banco de dados acessível
- [ ] Uploads funcionando
- [ ] Testes end-to-end passando
- [ ] Backup configurado

---

**Boa sorte com seu deploy! 🚀**

