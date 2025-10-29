// Vercel Serverless Function - Logout
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', 'session_id=; HttpOnly; Path=/; Max-Age=0');
  return res.json({ success: true });
};

