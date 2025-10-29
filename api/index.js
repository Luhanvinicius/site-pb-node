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
// Servir arquivos estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, '../public')));
// Servir imagens de patentes (compatibilidade com PHP)
app.use('/imagens', express.static(path.join(__dirname, '../../imagens')));

// Conexão direta com PostgreSQL - EXATAMENTE como no PHP
// PHP usa: host=localhost ou host=37.148.132.118, user=postgres, password=1988, dbname=postgres
// IMPORTANTE: Banco da VPS não usa SSL!
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1988@37.148.132.118:5432/postgres';

const pool = new Pool({
  connectionString: connectionString,
  // VPS não suporta SSL - apenas serviços cloud precisam
  ssl: connectionString.includes('supabase') || 
       connectionString.includes('amazonaws') || 
       connectionString.includes('heroku') ||
       connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false } 
    : false, // VPS usa conexão sem SSL
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Testar conexão na inicialização
pool.query('SELECT 1')
  .then(() => console.log('✅ Conexão PostgreSQL estabelecida'))
  .catch((err) => console.error('❌ Erro ao conectar PostgreSQL:', err.message));

pool.on('error', (err, client) => {
  console.error('❌ Erro no pool PostgreSQL:', err);
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
    
    console.log('🔐 Tentativa de login:', username); // Debug
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // EXATAMENTE como no PHP
    const login = antiInjection(username).trim();
    const senha = antiInjection(password).trim();
    const encryptedPass = encryptPassword(senha);

    console.log('🔍 Query:', `SELECT * FROM accounts WHERE login = $1 AND password = $2`);
    console.log('🔍 Login (sanitizado):', login);
    console.log('🔍 Senha (hash):', encryptedPass.substring(0, 20) + '...');

    // Query EXATA do PHP: SELECT * FROM accounts WHERE login = '$login' AND password = '$encript'
    const query = 'SELECT * FROM accounts WHERE login = $1 AND password = $2';
    const result = await pool.query(query, [login, encryptedPass]);
    
    console.log('📊 Resultados encontrados:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('❌ Login falhou: usuário não encontrado');
      return res.status(401).json({ error: 'Login ou senha incorretos' });
    }

    const user = result.rows[0];
    console.log('✅ Login bem-sucedido:', user.login, 'ID:', user.player_id);
    
    // Cookie configurado
    const cookieOptions = [
      `session_id=${user.player_id}`,
      'HttpOnly',
      'Path=/',
      'Max-Age=86400',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
      process.env.NODE_ENV === 'production' ? 'SameSite=None' : 'SameSite=Lax'
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    res.json({
      success: true,
      user: {
        id: user.player_id,
        login: user.login,
        name: user.player_name || user.login,
        access_level: user.access_level || 0
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao processar login',
      message: error.message 
    });
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

// Rotas para páginas específicas
app.get('/ranking', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/ranking.html'));
});

app.get('/admin', checkSession, async (req, res) => {
  try {
    const userId = req.cookies.session_id || req.headers['x-session-id'];
    const userResult = await pool.query('SELECT * FROM accounts WHERE player_id = $1', [userId]);
    
    if (userResult.rows.length === 0 || !userResult.rows[0].access_level || userResult.rows[0].access_level < 3) {
      return res.status(403).send('Acesso negado. Necessário access_level >= 3');
    }
    
    res.sendFile(path.join(__dirname, '../public/admin.html'));
  } catch (error) {
    console.error('Admin access error:', error);
    res.status(500).send('Erro ao verificar permissões');
  }
});

// API de ranking completo
app.get('/api/ranking-full', async (req, res) => {
  try {
    const page = parseInt(req.query.pagina) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Query exata do PHP
    const query = `
      SELECT * FROM accounts 
      WHERE rank < 53 AND player_name <> '' AND ban_obj_id = 0
      ORDER BY exp DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    
    // Calcular K/D e Win/Lost
    const players = result.rows.map((player, index) => {
      const kills = player.kills_count || 0;
      const deaths = player.deaths_count || 0;
      const wins = player.fights_win || 0;
      const lost = player.fights_lost || 0;
      
      const kd = kills + deaths > 0 ? Math.round((kills / (kills + deaths)) * 100) : 0;
      const wl = wins + lost > 0 ? Math.round((wins / (wins + lost)) * 100) : 0;
      
      return {
        position: offset + index + 1,
        player_name: player.player_name,
        rank: player.rank,
        exp: player.exp,
        kd: kd,
        wl: wl,
        escapes: player.escapes || 0,
        kills_count: kills,
        deaths_count: deaths,
        fights_win: wins,
        fights_lost: lost
      };
    });

    // Total de páginas
    const totalResult = await pool.query(
      "SELECT COUNT(*) as count FROM accounts WHERE rank < 53 AND player_name <> '' AND ban_obj_id = 0"
    );
    const total = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({ players, totalPages, currentPage: page, total });
  } catch (error) {
    console.error('Ranking error:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// Buscar jogador por nick
app.get('/api/ranking/search', async (req, res) => {
  try {
    const nick = req.query.nick;
    if (!nick) {
      return res.status(400).json({ error: 'Nick é obrigatório' });
    }

    const query = `
      SELECT * FROM accounts 
      WHERE player_name LIKE $1 AND rank < 53 
      ORDER BY exp DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [`%${nick}%`]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const player = result.rows[0];
    
    // Calcular posição
    const positionResult = await pool.query(
      'SELECT COUNT(*) as count FROM accounts WHERE exp > $1 AND rank < 52',
      [player.exp]
    );
    const position = parseInt(positionResult.rows[0].count) + 1;

    // Calcular K/D e Win/Lost
    const kills = player.kills_count || 0;
    const deaths = player.deaths_count || 0;
    const wins = player.fights_win || 0;
    const lost = player.fights_lost || 0;
    
    const kd = kills + deaths > 0 ? Math.round((kills / (kills + deaths)) * 100) : 0;
    const wl = wins + lost > 0 ? Math.round((wins / (wins + lost)) * 100) : 0;

    res.json({
      position: position,
      player_name: player.player_name,
      rank: player.rank,
      exp: player.exp,
      kd: kd,
      wl: wl,
      escapes: player.escapes || 0
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Erro ao buscar jogador' });
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
