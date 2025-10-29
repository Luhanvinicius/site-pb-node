# 🔧 Fix: Porta 3000 já está em uso

## ❌ Erro
```
Error: listen EADDRINUSE: address already in use :::3000
```

## ✅ Soluções

### Opção 1: Usar Vercel Dev (RECOMENDADO)
```bash
npm run dev
# ou
vercel dev
```
Isso usa o ambiente do Vercel e não precisa de porta local.

### Opção 2: Matar processo na porta 3000

**Windows:**
```bash
# Encontrar o processo
netstat -ano | findstr :3000

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID [PID] /F
```

**Linux/Mac:**
```bash
# Encontrar e matar
lsof -ti:3000 | xargs kill -9
# ou
killall -9 node
```

### Opção 3: Usar porta diferente
```bash
# Já configurado no código - usa porta 3001
npm run start:local
# ou
PORT=3001 node api/index.js
```

## 🎯 Recomendação

**Sempre use `vercel dev` para desenvolvimento local!**

```bash
npm run dev
```

Isso simula o ambiente do Vercel e usa serverless functions corretamente.

