# 🚀 Deploy no Vercel com Banco na VPS

## ✅ Configuração para VPS: 37.148.132.118

### 📋 Passo 1: Configurar Variável de Ambiente no Vercel

1. Acesse **Vercel Dashboard** → Seu projeto → **Settings** → **Environment Variables**

2. Adicione a variável:
   ```
   Nome: DATABASE_URL
   Valor: postgresql://postgres:1988@37.148.132.118:5432/postgres
   ```

3. **IMPORTANTE**: Marque para todos os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Clique em **Save**

### 🔒 Passo 2: Configurar Firewall na VPS

O PostgreSQL precisa aceitar conexões externas:

```bash
# No servidor VPS (37.148.132.118)

# 1. Editar postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
# Procure por: listen_addresses
# Altere para: listen_addresses = '*'

# 2. Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Adicione no final:
host    all             all             0.0.0.0/0               md5

# 3. Reiniciar PostgreSQL
sudo systemctl restart postgresql

# 4. Verificar firewall (porta 5432 deve estar aberta)
sudo ufw allow 5432/tcp
```

### 📤 Passo 3: Deploy no Vercel

1. **Conecte repositório GitHub** com a pasta `tactical`

2. **Configurações do projeto**:
   - Framework Preset: **Other**
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
   - Install Command: `npm install`

3. **Environment Variables** (já configurado no passo 1)

4. Clique em **Deploy**

### ✅ Passo 4: Verificar

Depois do deploy, teste:

```
https://seu-projeto.vercel.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 🔧 Troubleshooting

### Erro: "Connection refused" ou "Connection timeout"

**Causa**: Firewall ou PostgreSQL não aceita conexões externas

**Solução**:
1. Verifique se porta 5432 está aberta no firewall da VPS
2. Verifique se PostgreSQL está escutando em `0.0.0.0` e não só `localhost`
3. Teste conexão manualmente:
   ```bash
   psql -h 37.148.132.118 -U postgres -d postgres
   ```

### Erro: "FATAL: password authentication failed"

**Causa**: Senha incorreta ou usuário sem permissão

**Solução**:
1. Verifique se a senha está correta (`1988`)
2. Verifique se o usuário `postgres` tem permissão para conectar remotamente

### Erro: "SSL required"

**Causa**: VPS requer SSL mas conexão não está usando

**Solução**: Já configurado! O código usa `ssl: { rejectUnauthorized: false }` automaticamente para IP da VPS.

## 📝 Connection String Format

```
postgresql://[usuario]:[senha]@[host]:[porta]/[database]
```

Para sua VPS:
```
postgresql://postgres:1988@37.148.132.118:5432/postgres
```

## ⚠️ Importante

- ✅ Código já está otimizado para serverless (max: 1 conexão)
- ✅ SSL configurado automaticamente para VPS
- ✅ Pool de conexões reutilizado entre requests
- ✅ Timeout configurado (5 segundos)

## 🎯 Pronto!

Depois de configurar a variável `DATABASE_URL` no Vercel, o site vai conectar automaticamente com sua VPS!

