# 🚀 Deploy no Render.com

## ✅ Configurado para Render!

### 📋 Passo 1: Configurar no Render Dashboard

Na tela que você está vendo:

1. **Name**: `tactical` ou `tactical-site` (pode deixar `site-pb` se quiser)

2. **Root Directory**: 
   ```
   tactical
   ```
   ⚠️ **IMPORTANTE**: Se o repositório tem a pasta `tactical`, coloque isso aqui!

3. **Build Command**:
   ```
   npm install
   ```

4. **Start Command**:
   ```
   npm start
   ```

5. **Clique em "Create Web Service"**

### 🔐 Passo 2: Configurar Variáveis de Ambiente

Depois de criar o serviço:

1. Vá em **Environment** (menu lateral)

2. Adicione:
   ```
   DATABASE_URL = postgresql://postgres:1988@37.148.132.118:5432/postgres
   NODE_ENV = production
   ```

3. Clique em **Save Changes**

### 🌐 Passo 3: Deploy Automático

- Render faz deploy automaticamente do branch `main`
- Primeiro deploy pode levar 5-10 minutos
- Você verá logs do build em tempo real

### 🔒 Passo 4: Configurar Firewall da VPS

Certifique-se que na VPS (`37.148.132.118`):

```bash
# Porta 5432 deve estar aberta
sudo ufw allow 5432/tcp

# PostgreSQL deve aceitar conexões externas
# Edite: /etc/postgresql/*/main/postgresql.conf
# listen_addresses = '*'

# Edite: /etc/postgresql/*/main/pg_hba.conf
# Adicione: host all all 0.0.0.0/0 md5
```

### ✅ Testar

Depois do deploy, seu site estará em:
```
https://tactical-site.onrender.com
```

Ou o nome que você escolheu.

Teste a API:
```
https://tactical-site.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 🔧 Troubleshooting

### Erro: "Module not found"

**Solução**: 
- Verifique se **Root Directory** está correto (`tactical`)
- Verifique se `package.json` está na pasta correta

### Erro: "Cannot find module 'server.js'"

**Solução**:
- Certifique-se que **Start Command** é: `npm start`
- Verifique se `server.js` está na raiz da pasta `tactical`

### Erro de conexão com banco

**Solução**:
1. Verifique `DATABASE_URL` nas variáveis de ambiente
2. Teste conexão manualmente:
   ```bash
   psql -h 37.148.132.118 -U postgres -d postgres
   ```
3. Verifique firewall da VPS

### Site fica "sleeping"

**Solução**:
- Plano free do Render "hiberna" após 15 min de inatividade
- Primeira requisição após hibernar demora ~30 segundos
- Para evitar: upgrade para plano pago ou use sempre que precisar

## 📝 Estrutura Esperada no Render

```
Repositório GitHub:
└── tactical/
    ├── server.js          ← Arquivo principal
    ├── package.json       ← Dependências
    ├── api/
    │   ├── index.js      ← Express app
    │   └── *.js          ← APIs
    └── public/           ← Arquivos estáticos
```

Se seu repositório é assim:
```
github.com/user/repo/
└── tactical/
    └── ...
```

Coloque **Root Directory**: `tactical`

Se seu repositório já está dentro de `tactical`:
```
github.com/user/tactical/
└── ...
```

Deixe **Root Directory** vazio!

## ⚙️ Configurações Recomendadas

- **Auto-Deploy**: ON (deploy automático a cada push)
- **Branch**: `main` ou `master`
- **Plan**: Free (suficiente para começar)

## 🎯 Pronto!

Depois de configurar e fazer o primeiro deploy, cada push no GitHub vai fazer deploy automático!

