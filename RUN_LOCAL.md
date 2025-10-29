# 🚀 Rodar Localmente (100% Local)

## ✅ Configurado para rodar sem Vercel!

## 📋 Passos

### 1. Instalar dependências (se ainda não instalou)
```bash
cd tactical
npm install
```

### 2. Configurar banco de dados

Crie arquivo `.env` na raiz:
```env
DATABASE_URL=postgresql://postgres:1988@localhost:5432/postgres
```

Ou configure direto em `api/index.js` (linha 19)

### 3. Rodar servidor
```bash
npm start
```

Ou:
```bash
node api/index.js
```

### 4. Acessar

- **Site**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## ⚠️ Porta em uso?

Se a porta 3001 também estiver ocupada, mude:

**Windows:**
```bash
set PORT=3002 && node api/index.js
```

**Linux/Mac:**
```bash
PORT=3002 node api/index.js
```

Ou edite `api/index.js` linha 280 e mude:
```javascript
const PORT = process.env.PORT || 3002; // Qualquer porta livre
```

## ✅ Funcionalidades que funcionam localmente

- ✅ Login/Registro
- ✅ Ranking
- ✅ Notícias
- ✅ Stats do servidor
- ✅ Painel do usuário
- ✅ Todas as APIs REST

## 🔧 Troubleshooting

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando
- Confira a `DATABASE_URL` no `.env` ou `api/index.js`

### Porta já em uso
- Use porta diferente (3002, 3003, etc)
- Ou mate o processo na porta: `taskkill /PID [PID] /F`

### Módulo não encontrado
- Execute: `npm install`

## 🎯 Pronto!

Agora roda 100% local, sem precisar de Vercel!

