# 🔍 Testar Conexão com Banco

## ⚠️ Verificar no Render:

1. **Vá em Logs** no Render
2. **Procure por**: `✅ Conexão PostgreSQL estabelecida`
3. **Se aparecer**: `❌ Erro ao conectar PostgreSQL: ...`

## 🔧 Verificar DATABASE_URL:

No Render → Environment → Verifique:
```
DATABASE_URL = postgresql://postgres:1988@37.148.132.118:5432/postgres
```

## 🧪 Teste Manual:

Quando fizer login, os logs devem mostrar:
```
🔐 Tentativa de login: [username]
🔍 Query: SELECT * FROM accounts WHERE login = $1 AND password = $2
🔍 Login (sanitizado): [login]
📊 Resultados encontrados: 1 ou 0
✅ Login bem-sucedido: [login] ID: [id]
```

Se aparecer `❌ Login falhou: usuário não encontrado`:
- Verifique se o usuário existe no banco
- Verifique se a senha está correta
- Verifique se o hash está sendo gerado igual ao PHP

## 🔑 Como o PHP faz:

1. `encripitar($senha)` → `hash_hmac('md5', $senha, '/x!a@r-$r%an¨.&e&+f*f(f(a)')`
2. Query: `SELECT * FROM accounts WHERE login = '$login' AND password = '$encript'`
3. Retorna: `$objResult['player_id']`, `$objResult['login']`, `$objResult['player_name']`

## 📝 Node.js deve fazer IGUAL:

Já está implementado! Se não funcionar, veja os logs no Render.

