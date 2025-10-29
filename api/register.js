// Vercel Serverless Function - Register
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

    // Verificar se usuário já existe
    const checkUser = await query('SELECT * FROM accounts WHERE login = $1', [login]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Este usuário já está em uso' });
    }

    // Verificar email
    const checkEmail = await query('SELECT * FROM accounts WHERE email = $1', [emailClean]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já foi usado' });
    }

    // Criar conta
    const insertQuery = `
      INSERT INTO accounts (login, password, email, gp, money, token, data_nasc)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING player_id, login
    `;

    const newUser = await query(insertQuery, [
      login, encryptedPass, emailClean, 200000, 150000, login, dateClean
    ]);

    // Configurar cookie de sessão
    const cookieOptions = [
      `session_id=${newUser.rows[0].player_id}`,
      'HttpOnly',
      'Path=/',
      'Max-Age=86400',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
      process.env.NODE_ENV === 'production' ? 'SameSite=None' : 'SameSite=Lax'
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    return res.json({
      success: true,
      message: 'Conta criada com sucesso!',
      user: {
        id: newUser.rows[0].player_id,
        login: newUser.rows[0].login
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Erro ao criar conta' });
  }
};
