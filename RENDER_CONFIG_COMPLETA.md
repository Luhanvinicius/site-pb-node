# 📋 Configuração Completa Render.com

## ✅ Campos para Preencher

### 1. **Name**
```
site-pb-node
```
(Ou pode mudar para `tactical` se preferir)

---

### 2. **Root Directory**
⚠️ **IMPORTANTE!** Depende da estrutura do seu repositório:

**Opção A - Código na RAIZ do repositório:**
```
(deixe VAZIO)
```

**Opção B - Código numa PASTA (ex: `tactical`):**
```
tactical
```

**Como saber qual usar?**
- Acesse seu repositório no GitHub
- Se você vê: `package.json`, `server.js`, `api/` na raiz → **deixe vazio**
- Se você vê uma pasta `tactical/` com os arquivos dentro → **coloque `tactical`**

---

### 3. **Build Command**
```
npm install
```
(Já deve estar preenchido ✅)

---

### 4. **Start Command** ⚠️ **MUDAR**
```
npm start
```

**Ou alternativamente:**
```
node server.js
```

**NÃO use:** `node api/index.js` (esse é para Vercel)

---

### 5. **Instance Type**
Selecione:
- ✅ **Free** ($0/month) - Para começar
- Starter ($7/month) - Se precisar de mais poder

---

### 6. **Environment Variables** 🔐 **ADICIONAR**
Clique em **"Add Environment Variable"**:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres:1988@37.148.132.118:5432/postgres` |
| `NODE_ENV` | `production` |

**Pode adicionar agora ou depois do deploy.**

---

### 7. **Health Check Path** ⚠️ **MUDAR**
```
/api/health
```

**Mude de:** `/healthz` **para:** `/api/health`

---

### 8. **Auto-Deploy**
Deixe **✅ On**
(Deploy automático a cada push no GitHub)

---

### 9. **Branch**
```
main
```
(Já está correto ✅)

---

## 🚀 Clique em "Create Web Service"

---

## ✅ Depois do Deploy

1. **Aguarde o build** (5-10 minutos na primeira vez)

2. **Adicione variáveis de ambiente** (se ainda não adicionou):
   - Vá em **Environment** (menu lateral)
   - Adicione `DATABASE_URL` e `NODE_ENV`
   - Clique em **Save Changes**
   - Isso vai fazer um novo deploy

3. **Teste o site:**
   - URL será: `https://site-pb-node.onrender.com`
   - Teste: `https://site-pb-node.onrender.com/api/health`

---

## 🧪 Verificar se Funcionou

Acesse:
```
https://site-pb-node.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 🔧 Troubleshooting

### Erro: "Cannot find module 'server.js'"
**Solução:**
- Verifique **Root Directory** está correto
- Verifique se `server.js` existe na pasta raiz ou na pasta `tactical`

### Erro: "Cannot find module"
**Solução:**
- Verifique se **Build Command** é: `npm install`
- Veja os logs do build no Render

### Site não conecta ao banco
**Solução:**
1. Verifique se `DATABASE_URL` está nas variáveis de ambiente
2. Verifique se firewall da VPS permite porta 5432
3. Veja os logs do serviço no Render

---

## 📝 Checklist Final

- [ ] Root Directory configurado (vazio ou `tactical`)
- [ ] Start Command: `npm start`
- [ ] Build Command: `npm install`
- [ ] Health Check: `/api/health`
- [ ] Instance Type: Free (ou Starter)
- [ ] Environment Variables adicionadas
- [ ] Clique em "Create Web Service"
- [ ] Aguarde deploy completar
- [ ] Teste `/api/health`

---

**Pronto para fazer deploy! 🚀**

