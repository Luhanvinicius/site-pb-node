// Vercel Serverless Function - News
const { query } = require('./db');

module.exports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = 15;
    const offset = page * limit;

    const dbQuery = `
      SELECT * FROM noticias 
      ORDER BY id DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await query(dbQuery, [limit, offset]);
    return res.json({ news: result.rows });
  } catch (error) {
    console.error('News error:', error);
    return res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
};
