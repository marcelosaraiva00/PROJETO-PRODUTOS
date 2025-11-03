# 🚀 Como Deixar seu Sistema Online

## Opções Disponíveis

### 🥇 **Opção 1: Railway.app (MAIS FÁCIL - Recomendado)**

Railway é a opção mais simples para iniciantes. Você pode fazer deploy em 5 minutos!

#### Passo a Passo:

1. **Acesse** https://railway.app e faça login com sua conta GitHub

2. **Clique** em "New Project" e escolha "Deploy from GitHub repo"

3. **Selecione** seu repositório `PROJETO-PRODUTOS`

4. **Configure as variáveis de ambiente:**
   - Vá em "Variables" → "Raw Editor"
   - Adicione:
   ```
   NODE_ENV=production
   JWT_SECRET=seu_secret_super_seguro_mude_isso
   PORT=5000
   ```

5. **Aguarde** o deploy (pode demorar 2-5 minutos)

6. **Pronto!** Railway gerará um link tipo: `https://seu-app.railway.app`

#### Preço:
- ✅ **Grátis** até $5 de crédito por mês
- Depois disso, paga apenas conforme usa

---

### 🥈 **Opção 2: Render.com**

Render também é simples e tem um plano gratuito.

#### Passo a Passo:

1. **Acesse** https://render.com e faça login com GitHub

2. **Clique** em "New +" → "Web Service"

3. **Conecte** seu repositório do GitHub

4. **Configure:**
   - **Name:** estoque-facil
   - **Build Command:** `npm run install-all && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

5. **Adicione variáveis de ambiente:**
   ```
   NODE_ENV=production
   JWT_SECRET=seu_secret_super_seguro_mude_isso
   ```

6. **Salve** e aguarde o deploy

#### Preço:
- ✅ **Grátis** com algumas limitações
- Planos pagos a partir de $7/mês

---

### 🥉 **Opção 3: VPS (Servidor Virtual)**

Para quem quer mais controle. Recomendado: **DigitalOcean** ou **Contabo**

#### Passo a Passo Simplificado:

1. **Contrate um VPS** (ex: DigitalOcean Droplet de $5/mês)

2. **Conecte via SSH:**
   ```bash
   ssh root@seu-ip
   ```

3. **Instale Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```

4. **Clone seu projeto:**
   ```bash
   git clone https://github.com/seu-usuario/PROJETO-PRODUTOS.git
   cd PROJETO-PRODUTOS
   ```

5. **Instale dependências:**
   ```bash
   npm run install-all
   npm run build
   ```

6. **Instale PM2** (gerenciador de processos):
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name estoque-facil
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx** (proxy reverso):
   ```bash
   sudo apt install nginx
   ```
   
   Crie arquivo `/etc/nginx/sites-available/estoque-facil`:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Ative:
   ```bash
   sudo ln -s /etc/nginx/sites-available/estoque-facil /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. **Configure SSL gratuito:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

---

## ⚙️ **Configurações Importantes**

### Variáveis de Ambiente

Sempre configure estas variáveis em produção:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ativa modo produção |
| `JWT_SECRET` | Sua chave secreta | Altere para algo aleatório e seguro |
| `PORT` | `5000` (ou o que a plataforma pedir) | Porta do servidor |

### Como Gerar JWT_SECRET Seguro:

```bash
# No terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔒 **Segurança em Produção**

### ⚠️ NUNCA faça:

- ❌ Deixar `JWT_SECRET` como padrão
- ❌ Expor credenciais no código
- ❌ Não usar HTTPS
- ❌ Deixar banco de dados exposto

### ✅ SEMPRE faça:

- ✅ Use HTTPS
- ✅ Altere `JWT_SECRET` para algo seguro
- ✅ Use variáveis de ambiente
- ✅ Faça backups regulares do banco SQLite
- ✅ Monitore logs da aplicação

---

## 📊 **Depois do Deploy**

### Teste sua aplicação:

1. Acesse o link fornecido
2. Faça login com suas credenciais
3. Verifique se todas as funcionalidades estão funcionando
4. Teste upload de imagens
5. Faça uma venda de teste

### Se algo der errado:

1. **Verifique os logs** da plataforma
2. **Confirme variáveis de ambiente** estão configuradas
3. **Verifique** se o build foi bem-sucedido
4. **Teste localmente** primeiro

---

## 💰 **Comparação de Custos**

| Plataforma | Preço Inicial | Ideal Para |
|------------|---------------|------------|
| **Railway** | Grátis até $5 | Iniciantes, projetos pequenos |
| **Render** | Grátis limitado | Projetos pequenos/médios |
| **DigitalOcean VPS** | $5/mês | Projetos sérios, mais controle |
| **Contabo VPS** | €4/mês (~$4) | Melhor custo/benefício |

---

## 🆘 **Dúvidas Comuns**

### "Meu deploy falhou"
- ✅ Verifique se todas as dependências estão instaladas
- ✅ Confirme que todas as variáveis de ambiente estão configuradas
- ✅ Veja os logs de erro na plataforma

### "A aplicação não carrega"
- ✅ Verifique se o build foi executado com sucesso
- ✅ Confirme que a variável `NODE_ENV=production` está definida
- ✅ Teste se o backend está respondendo

### "Upload de imagens não funciona"
- ✅ Verifique permissões da pasta `uploads/`
- ✅ Confirme que o backend tem espaço em disco
- ✅ Veja logs de erro no Multer

### "Banco de dados sumiu"
- ✅ SQLite pode ser perdido em deploys
- ✅ Configure backup automático
- ✅ Considere migrar para PostgreSQL em produção

---

## 📞 **Precisa de Ajuda?**

- 📖 Leia o arquivo `DEPLOY.md` para mais detalhes técnicos
- 🐛 Abra uma issue no GitHub se encontrar problemas
- 💬 Entre em contato pelo repositório

---

## ✅ **Checklist de Deploy**

Antes de finalizar, verifique:

- [ ] Aplicação está rodando e acessível
- [ ] Login funciona corretamente
- [ ] Upload de imagens funciona
- [ ] Vendas são registradas
- [ ] Relatórios são gerados
- [ ] SSL/HTTPS está configurado
- [ ] Backup do banco está configurado
- [ ] Logs estão sendo monitorados

---

## 🎉 **Parabéns!**

Você colocou seu sistema online! Agora você pode:

- ✅ Acessar de qualquer lugar
- ✅ Compartilhar com sua equipe
- ✅ Vender para clientes
- ✅ Ter seus dados seguros na nuvem

**Boa sorte com seu sistema de estoque! 🚀**

