// Vercel Serverless Function - Server Stats
const { query } = require('./db');

module.exports = async (req, res) => {
  try {
    const online = await query("SELECT COUNT(*) as count FROM accounts WHERE online = 't'");
    const total = await query("SELECT COUNT(*) as count FROM accounts WHERE rank < 53");
    const records = await query('SELECT total FROM web_records WHERE id = 1');

    return res.json({
      online: parseInt(online.rows[0].count),
      total: parseInt(total.rows[0].count),
      record: records.rows.length > 0 ? parseInt(records.rows[0].total) : 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
