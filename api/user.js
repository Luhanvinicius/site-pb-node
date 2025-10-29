// Vercel Serverless Function - Get User
const { query } = require('./db');

module.exports = async (req, res) => {
  try {
    const sessionId = req.cookies.session_id || req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const result = await query('SELECT * FROM accounts WHERE player_id = $1', [sessionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    return res.json({
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
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
};
