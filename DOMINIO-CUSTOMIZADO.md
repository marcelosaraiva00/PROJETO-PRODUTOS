# 🌐 Como Configurar Domínio Customizado (www.estoquefacil.com.br)

## 📌 Entendendo os Conceitos

### O que você precisa:

1. **Domínio** (`www.estoquefacil.com.br`) 
   - É como o "endereço" do seu site na internet
   - Exemplos: `.com`, `.com.br`, `.net`, etc.
   - Você compra em registradores: Registro.br, GoDaddy, Namecheap, etc.

2. **Hospedagem** (onde o código fica)
   - É o "servidor" que roda sua aplicação
   - Opções: Railway, Render, VPS, etc.
   - A aplicação fica em um link temporário tipo: `https://seu-app-123456.railway.app`

3. **Conectar domínio à hospedagem**
   - Você "aponta" seu domínio para onde a aplicação está rodando

---

## 🎯 Resumo Rápido

**NÃO, você NÃO precisa "enviar arquivos manualmente"!**

A maioria das plataformas modernas (Railway, Render) conectam automaticamente ao seu GitHub e fazem deploy automaticamente.

---

## 🛒 Passo 1: Comprar um Domínio

### Opções de Registradores no Brasil:

1. **Registro.br** (recomendado para .br)
   - Site: https://registro.br
   - Preço: ~R$ 40/ano para .com.br
   - Interface em português
   - Melhor para domínios brasileiros

2. **GoDaddy**
   - Site: https://www.godaddy.com
   - Preço: Variável (promoções)
   - Interface multilingue

3. **Namecheap**
   - Site: https://www.namecheap.com
   - Preço: Variável
   - Interface em inglês

### Como Comprar no Registro.br:

1. Acesse https://registro.br
2. Digite `estoquefacil.com.br` na busca
3. Se estiver disponível, adicione ao carrinho
4. Preencha seus dados
5. Faça o pagamento
6. Aguarde ativação (1-2 horas)

**Exemplo de custo:** R$ 40/ano para .com.br

---

## 🚂 Passo 2: Fazer Deploy na Hospedagem

Você tem 3 opções principais:

### Opção A: Railway.app (Fácil) ⭐ Recomendado

1. **Deploy automático:**
   - Faça login em https://railway.app com GitHub
   - Conecte seu repositório `PROJETO-PRODUTOS`
   - Railway detecta e faz deploy automaticamente
   - Configure variáveis de ambiente (NODE_ENV, JWT_SECRET)

2. **Você recebe um link:**
   ```
   https://projeto-produtos-production.up.railway.app
   ```

3. **Conectar domínio customizado:**
   - No Railway, vá em "Settings" → "Networking"
   - Clique em "Generate Domain" (para teste)
   - Role até "Custom Domain"
   - Adicione: `estoquefacil.com.br`
   - Railway fornece instruções de DNS

4. **Configurar DNS no Registro.br:**
   - Acesse https://registro.br
   - Vá em "Meus Domínios" → "Gerenciar DNS"
   - Adicione registro CNAME:
     ```
     Nome: www
     Tipo: CNAME
     Valor: projeto-produtos-production.up.railway.app
     ```
   - Ou registro A (se Railway fornecer IP)

**Custo total:**
- Domínio: R$ 40/ano
- Railway: Grátis até $5/mês

### Opção B: Render.com

1. **Deploy automático:**
   - Faça login em https://render.com com GitHub
   - Conecte seu repositório
   - Render faz deploy automaticamente

2. **Você recebe um link:**
   ```
   https://projeto-produtos.onrender.com
   ```

3. **Conectar domínio:**
   - Em "Settings" → "Custom Domains"
   - Adicione: `estoquefacil.com.br`
   - Render fornece registros DNS

4. **Configurar DNS:**
   - No Registro.br, adicione CNAME apontando para Render

**Custo total:**
- Domínio: R$ 40/ano
- Render: Grátis (com limitações) ou $7/mês

### Opção C: VPS (Servidor Virtual) - Avançado

Para quem quer controle total:

1. **Contratar VPS:**
   - DigitalOcean: $5/mês (~R$ 25)
   - Contabo: €4/mês (~R$ 20)
   - Hostgator/Locaweb no Brasil

2. **Deploy manual:**
   ```bash
   # Conectar via SSH
   ssh root@seu-ip
   
   # Instalar Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git nginx
   
   # Clonar repositório
   git clone https://github.com/seu-usuario/PROJETO-PRODUTOS.git
   cd PROJETO-PRODUTOS
   
   # Instalar dependências
   npm install
   cd frontend && npm install && npm run build
   cd ..
   
   # Instalar PM2 (gerenciador de processos)
   npm install -g pm2
   pm2 start backend/server.js --name estoque-facil
   pm2 save
   ```

3. **Configurar Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/estoquefacil
   ```
   
   Conteúdo:
   ```nginx
   server {
       listen 80;
       server_name estoquefacil.com.br www.estoquefacil.com.br;
       
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
   
   Ativar:
   ```bash
   sudo ln -s /etc/nginx/sites-available/estoquefacil /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Configurar DNS:**
   - No Registro.br, aponte A para IP do VPS
   - Ou use Cloudflare (gratuito) como CDN

**Custo total:**
- Domínio: R$ 40/ano
- VPS: R$ 20-50/mês

---

## 🔧 Passo 3: Configurar DNS

### No Registro.br:

1. Faça login em https://registro.br
2. Vá em "Meus Domínios"
3. Clique em "Gerenciar DNS" para seu domínio
4. Adicione registros conforme sua hospedagem:

#### Para Railway/Render:
```
Nome: www
Tipo: CNAME
Valor: seu-app-123456.up.railway.app (link da plataforma)
```

#### Para VPS:
```
Nome: @
Tipo: A
Valor: 192.0.2.1 (IP do seu VPS)

Nome: www
Tipo: CNAME
Valor: estoquefacil.com.br
```

5. Aguarde propagação DNS (1-24 horas)

---

## 🔒 Passo 4: Configurar SSL/HTTPS (Obrigatório!)

**NÃO deixe seu site sem HTTPS!** Sem HTTPS, navegadores mostram aviso de "inseguro".

### Railway e Render:
- ✅ Configuram SSL automaticamente
- ✅ SSL é gratuito e renovado automaticamente
- ✅ Sem configuração manual

### VPS:
Configure com Let's Encrypt (grátis):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d estoquefacil.com.br -d www.estoquefacil.com.br
```

Ele renova automaticamente!

---

## 📊 Como Funciona o Processo

```
1. Você compra domínio: estoquefacil.com.br
   ↓
2. Faz deploy na hospedagem (Railway/Render/VPS)
   ↓
3. Hospedagem gera link: https://app-123.railway.app
   ↓
4. Você configura DNS para apontar:
   estoquefacil.com.br → app-123.railway.app
   ↓
5. Usuários acessam: www.estoquefacil.com.br
   ↓
6. DNS resolve para: app-123.railway.app
   ↓
7. Sistema funciona! ✨
```

---

## 🔄 Atualizações Futuras

### Railway/Render:
```bash
# Você só faz commit no GitHub
git add .
git commit -m "Atualização"
git push origin main

# Plataforma detecta e faz deploy automático!
# Seu site atualiza sem você fazer nada! 🎉
```

### VPS:
```bash
ssh root@seu-ip
cd PROJETO-PRODUTOS
git pull
cd frontend && npm run build
pm2 restart estoque-facil
```

---

## 💰 Comparação de Custos

### Opção 1: Railway + Registro.br
- Domínio: R$ 40/ano
- Hospedagem: Grátis até $5/mês (~R$ 25/mês)
- **Total: ~R$ 340 no primeiro ano**

### Opção 2: Render + Registro.br
- Domínio: R$ 40/ano
- Hospedagem: Grátis limitado ou $7/mês (~R$ 35/mês)
- **Total: ~R$ 460 no primeiro ano**

### Opção 3: VPS + Registro.br
- Domínio: R$ 40/ano
- VPS: R$ 20-50/mês
- **Total: ~R$ 280-640 no primeiro ano**

### Opção 4: Cloudflare Pages (Frontend) + Railway (Backend)
- Domínio: R$ 40/ano
- Frontend: Grátis no Cloudflare
- Backend: Grátis no Railway
- **Total: R$ 40/ano! 🎉**

---

## ⚠️ Perguntas Frequentes

### "Preciso enviar arquivos manualmente?"
**NÃO!** Railway e Render conectam ao GitHub e fazem deploy automático. Você só faz commit.

### "Posso mudar de hospedagem depois?"
**SIM!** Você só precisa atualizar os registros DNS para apontar para nova hospedagem.

### "DNS está demorando?"
Propagação DNS pode levar 1-24 horas. Normal!

### "Como sei se está funcionando?"
Execute:
```bash
ping estoquefacil.com.br
```
Se retornar IP, está propagado!

### "Preciso de www?"
Não é obrigatório, mas recomendo configurar:
- `estoquefacil.com.br` → redireciona para `www.estoquefacil.com.br`
- `www.estoquefacil.com.br` → sua aplicação

### "E o email do domínio?"
Você pode configurar:
- Email profissional: `contato@estoquefacil.com.br`
- Opções: Google Workspace, Zoho, MXRoute
- Custo adicional: R$ 15-50/mês

---

## ✅ Checklist Completo

- [ ] Comprar domínio no Registro.br
- [ ] Fazer deploy na hospedagem (Railway/Render)
- [ ] Configurar variáveis de ambiente
- [ ] Conectar domínio customizado na plataforma
- [ ] Configurar registros DNS no Registro.br
- [ ] Verificar SSL/HTTPS ativo
- [ ] Testar acesso em `www.estoquefacil.com.br`
- [ ] Configurar backup do banco de dados
- [ ] Configurar monitoramento de uptime

---

## 🆘 Precisa de Ajuda?

1. **Problema de DNS:** Use https://www.whatsmydns.net para verificar propagação
2. **Problema de SSL:** Verifique se Let's Encrypt está configurado
3. **Deploy falhou:** Veja logs na plataforma
4. **Domínio não resolve:** Aguarde mais 1-2 horas

---

## 🎉 Conclusão

**Você NÃO precisa enviar arquivos manualmente!**

O processo moderno é:
1. Comprar domínio
2. Conectar GitHub à plataforma
3. Configurar DNS
4. Pronto! Deploy automático 🚀

**Recomendação:** Use **Railway + Registro.br** = Fácil + Barato + Automático

**Custo total:** ~R$ 340 no primeiro ano!

---

**Ainda tem dúvidas? Abra uma issue no GitHub! 💬**

