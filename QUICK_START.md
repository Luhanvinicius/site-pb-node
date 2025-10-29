# ⚡ Quick Start - Tactical no Vercel

## 🚀 Deploy Rápido (5 minutos)

### 1. Preparar Banco PostgreSQL
- Use **Supabase** (gratuito): https://supabase.com
- Crie projeto → Vá em Settings → Database
- Copie a **Connection String**

### 2. Deploy no Vercel

```bash
# Opção A: Via GitHub
1. Faça upload da pasta tactical para GitHub
2. Acesse vercel.com
3. "Add New Project" → Conecte GitHub
4. Selecione repositório
5. Em "Environment Variables", adicione:
   DATABASE_URL = [sua connection string]
6. Deploy!

# Opção B: Via CLI
cd tactical
npm install -g vercel
vercel login
vercel
# Siga as instruções
```

### 3. Configurar Variáveis

No painel Vercel:
- **Settings** → **Environment Variables**
- Adicione: `DATABASE_URL`
- Valor: sua connection string PostgreSQL

### 4. Pronto! 🎉

Seu site estará em: `https://seu-projeto.vercel.app`

---

## ✅ Verificar se Funcionou

Acesse: `https://seu-projeto.vercel.app/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 📝 Estrutura de Arquivos

```
tactical/
├── api/              ← APIs serverless (Vercel)
│   ├── login.js
│   ├── register.js
│   ├── user.js
│   ├── stats.js
│   ├── ranking.js
│   └── news.js
├── public/           ← Arquivos estáticos
│   ├── index.html    ← Página principal
│   ├── assets/
│   │   ├── style.css
│   │   └── app.js
│   └── images/
├── package.json      ← Dependências
├── vercel.json       ← Configuração Vercel
└── README.md
```

---

## 🔧 Tecnologias Usadas

- ✅ Node.js
- ✅ Express
- ✅ PostgreSQL (pg)
- ✅ Vercel Serverless Functions
- ✅ Bootstrap 4
- ✅ Font Awesome

---

## ✨ Funcionalidades

- [x] Login/Registro
- [x] Ranking de Jogadores
- [x] Notícias
- [x] Painel do Usuário
- [x] Stats do Servidor
- [x] Layout Responsivo

---

## 🎨 Customizar

1. **Logo/Imagens**: Adicione em `public/images/`
2. **Cores**: Edite `public/assets/style.css`
3. **Texto**: Edite `public/index.html`

---

## ⚠️ Importante

- O banco PostgreSQL precisa estar acessível externamente
- Use SSL connection string no Vercel
- Todas as APIs estão em `/api/*`

---

**Pronto para deploy! 🚀**

