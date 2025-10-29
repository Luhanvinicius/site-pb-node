// Servidor Express completo para rodar 100% local
// Todas as rotas estão implementadas aqui para desenvolvimento local

const express = require('express');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Conexão direta com PostgreSQL - sem helpers
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1988@37.148.132.118:5432/postgres';

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString.includes('37.148.132.118') || 
       connectionString.includes('supabase') || 
       connectionString.includes('amazonaws') || 
       connectionString.includes('heroku')
    ? { rejectUnauthorized: false } 
    : false,
  max: 10, // Pool de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log de erro na conexão
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Helper function para hash de senha (compatível com PHP antigo)
function encryptPassword(password) {
  const crypto = require('crypto');
  const salt = '/x!a@r-$r%an¨.&e&+f*f(f(a)';
  return crypto.createHmac('md5', salt).update(password).digest('hex');
}

// Helper para sanitizar inputs
function antiInjection(input) {
  if (!input) return '';
  return String(input)
    .replace(/(from|select|insert|delete|where|drop table|show tables|#|\*|--|\\)/gi, '')
    .trim()
    .replace(/<[^>]*>/g, '');
}

// Verificar sessão
function checkSession(req, res, next) {
  const sessionId = req.cookies.session_id || req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Rotas API (simular serverless functions localmente)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const login = antiInjection(username);
    const senha = antiInjection(password);
    const encryptedPass = encryptPassword(senha);

    const query = 'SELECT * FROM accounts WHERE login = $1 AND password = $2';
    const result = await pool.query(query, [login, encryptedPass]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Login ou senha incorretos' });
    }

    const user = result.rows[0];
    
    res.cookie('session_id', user.player_id, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user.player_id,
        login: user.login,
        name: user.player_name,
        access_level: user.access_level
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao processar login' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('session_id');
  res.json({ success: true });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, email, birthDate } = req.body;

    if (!username || !password || !confirmPassword || !email || !birthDate) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não correspondem' });
    }

    if (password.length < 5 || password.length > 10) {
      return res.status(400).json({ error: 'A senha deve ter entre 5 e 10 caracteres' });
    }

    const login = antiInjection(username).toLowerCase();
    const senha = antiInjection(password);
    const emailClean = antiInjection(email);
    const dateClean = antiInjection(birthDate);
    const encryptedPass = encryptPassword(senha);

    const checkUser = await pool.query('SELECT * FROM accounts WHERE login = $1', [login]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Este usuário já está em uso' });
    }

    const checkEmail = await pool.query('SELECT * FROM accounts WHERE email = $1', [emailClean]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já foi usado' });
    }

    const insertQuery = `
      INSERT INTO accounts (login, password, email, gp, money, token, data_nasc)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING player_id, login
    `;

    const newUser = await pool.query(insertQuery, [
      login, encryptedPass, emailClean, 200000, 150000, login, dateClean
    ]);

    res.cookie('session_id', newUser.rows[0].player_id, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Conta criada com sucesso!',
      user: {
        id: newUser.rows[0].player_id,
        login: newUser.rows[0].login
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

app.get('/api/user', checkSession, async (req, res) => {
  try {
    const userId = req.cookies.session_id || req.headers['x-session-id'];
    const result = await pool.query('SELECT * FROM accounts WHERE player_id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    res.json({
      id: user.player_id,
      login: user.login,
      name: user.player_name,
      rank: user.rank,
      exp: user.exp,
      gp: user.gp,
      money: user.money,
      access_level: user.access_level,
      ban_obj_id: user.ban_obj_id,
      online: user.online
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

app.get('/api/ranking', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = 30;
    const offset = page * limit;

    const query = `
      SELECT * FROM accounts 
      WHERE rank < 53 AND player_name <> '' AND ban_obj_id = 0
      ORDER BY exp DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    res.json({ players: result.rows });
  } catch (error) {
    console.error('Ranking error:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = 15;
    const offset = page * limit;

    const query = `
      SELECT * FROM noticias 
      ORDER BY id DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    res.json({ news: result.rows });
  } catch (error) {
    console.error('News error:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const online = await pool.query("SELECT COUNT(*) as count FROM accounts WHERE online = 't'");
    const total = await pool.query("SELECT COUNT(*) as count FROM accounts WHERE rank < 53");
    const records = await pool.query('SELECT total FROM web_records WHERE id = 1');

    res.json({
      online: parseInt(online.rows[0].count),
      total: parseInt(total.rows[0].count),
      record: records.rows.length > 0 ? parseInt(records.rows[0].total) : 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Health check simples - sem depender do banco (evita timeout no Render)
app.get('/api/health', async (req, res) => {
  // Retorna OK imediatamente - não testa banco (evita timeout)
  res.status(200).json({ 
    status: 'ok', 
    server: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check completo em rota diferente (opcional)
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      message: error.message 
    });
  }
});

// Servir arquivos estáticos
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Servidor Express - exportar app para uso externo (Render, Vercel, etc)
// Para rodar localmente, use server.js ou node api/index.js

// Apenas inicia servidor se executado diretamente E não estiver em ambiente serverless
if (require.main === module && !process.env.VERCEL && process.env.RENDER !== 'true') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🎯 TACTICAL - Servidor Local            ║
╠══════════════════════════════════════════╣
║   🌐 URL: http://localhost:${PORT}       ║
║   📝 API: http://localhost:${PORT}/api   ║
║   ✅ Servidor rodando!                   ║
╚══════════════════════════════════════════╝
    `);
  });
}

// Exportar app para Render.com (server.js usa isso)
module.exports = app;
