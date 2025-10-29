# 🎯 Tactical - Site de Jogo

Versão Node.js do projeto, totalmente compatível com **Vercel**.

## 🚀 Deploy no Vercel

### Passo 1: Configurar Variáveis de Ambiente

1. No painel do Vercel, vá em **Settings > Environment Variables**
2. Adicione:
   ```
   DATABASE_URL=postgresql://usuario:senha@host:5432/postgres
   ```

### Passo 2: Deploy

1. Conecte seu repositório GitHub
2. O Vercel detectará automaticamente o projeto
3. Configure:
   - **Framework Preset:** Other
   - **Build Command:** (vazio)
   - **Output Directory:** (vazio)
4. Clique em **Deploy**

### Passo 3: Configurar PostgreSQL

Você precisará de um banco PostgreSQL externo:
- **Heroku Postgres** (gratuito)
- **Supabase** (gratuito)
- **Railway PostgreSQL** (gratuito)
- **Neon** (gratuito)

## 📁 Estrutura do Projeto

```
tactical/
├── api/
│   └── index.js          # API Routes (Vercel Functions)
├── public/
│   ├── index.html        # Página principal
│   ├── assets/
│   │   ├── style.css     # Estilos
│   │   └── app.js        # JavaScript frontend
│   └── images/           # Imagens
├── package.json
├── vercel.json           # Configuração Vercel
└── .env.example
```

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar localmente com Vercel CLI
npm run dev

# Ou com Node puro
npm start
```

## 📦 Tecnologias

- **Node.js** + Express
- **PostgreSQL** (via pg)
- **Vercel** (deploy)
- **Bootstrap 4** (UI)
- **Font Awesome** (ícones)

## ✨ Funcionalidades

- ✅ Login/Registro
- ✅ Ranking
- ✅ Notícias
- ✅ Painel do usuário
- ✅ API RESTful
- ✅ Compatível com Vercel

## 🔐 Variáveis de Ambiente Necessárias

- `DATABASE_URL` - String de conexão PostgreSQL

