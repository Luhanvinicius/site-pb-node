// Helper compartilhado para conexão PostgreSQL otimizado para Vercel Serverless
const { Pool } = require('pg');

// Pool singleton para reutilizar conexões em serverless
let pool;

function getPool() {
  if (!pool) {
    // Connection string padrão para VPS
    const connectionString = process.env.DATABASE_URL || 
      'postgresql://postgres:1988@37.148.132.118:5432/postgres';
    
    pool = new Pool({
      connectionString: connectionString,
      // SSL necessário para conexão externa (VPS)
      ssl: connectionString.includes('37.148.132.118') || 
           connectionString.includes('supabase') || 
           connectionString.includes('amazonaws') || 
           connectionString.includes('heroku')
        ? { rejectUnauthorized: false } 
        : false,
      // Configurações otimizadas para serverless (Vercel)
      max: 1, // Máximo 1 conexão por serverless function (importante!)
      idleTimeoutMillis: 30000, // 30 segundos
      connectionTimeoutMillis: 5000, // 5 segundos timeout
      // Permitir reconexão automática
      allowExitOnIdle: true
    });

    // Log de erro (opcional)
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

// Função helper para queries
async function query(text, params) {
  const pool_instance = getPool();
  try {
    const result = await pool_instance.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = {
  getPool,
  query
};

