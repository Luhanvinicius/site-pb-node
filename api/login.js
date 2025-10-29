// Vercel Serverless Function - Login
const crypto = require('crypto');
const { query } = require('./db');

function encryptPassword(password) {
  const salt = '/x!a@r-$r%an¨.&e&+f*f(f(a)';
  return crypto.createHmac('md5', salt).update(password).digest('hex');
}

function antiInjection(input) {
  if (!input) return '';
  return String(input)
    .replace(/(from|select|insert|delete|where|drop table|show tables|#|\*|--|\\)/gi, '')
    .trim()
    .replace(/<[^>]*>/g, '');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const login = antiInjection(username);
    const senha = antiInjection(password);
    const encryptedPass = encryptPassword(senha);

    const dbQuery = 'SELECT * FROM accounts WHERE login = $1 AND password = $2';
    const result = await query(dbQuery, [login, encryptedPass]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Login ou senha incorretos' });
    }

    const user = result.rows[0];
    
    // Configurar cookie de sessão
    const cookieOptions = [
      `session_id=${user.player_id}`,
      'HttpOnly',
      'Path=/',
      'Max-Age=86400',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
      process.env.NODE_ENV === 'production' ? 'SameSite=None' : 'SameSite=Lax'
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    return res.json({
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
    return res.status(500).json({ error: 'Erro ao processar login' });
  }
};
