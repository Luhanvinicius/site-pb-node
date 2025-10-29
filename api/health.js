// Vercel Serverless Function - Health Check
const { query } = require('./db');

module.exports = async (req, res) => {
  try {
    await query('SELECT 1');
    return res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      message: error.message 
    });
  }
};
