// Vercel Serverless Function - Ranking
const { query } = require('./db');

module.exports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = 30;
    const offset = page * limit;

    const dbQuery = `
      SELECT * FROM accounts 
      WHERE rank < 53 AND player_name <> '' AND ban_obj_id = 0
      ORDER BY exp DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await query(dbQuery, [limit, offset]);
    return res.json({ players: result.rows });
  } catch (error) {
    console.error('Ranking error:', error);
    return res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
};
