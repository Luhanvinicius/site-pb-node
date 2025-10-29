// Servidor principal para Render.com
// Este é o arquivo que o Render vai executar
require('dotenv').config();

const app = require('./api/index');

// Render fornece PORT via variável de ambiente
const PORT = process.env.PORT || 3000;

// Render precisa que o servidor escute em 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`╔══════════════════════════════════════════╗`);
  console.log(`║   🎯 TACTICAL - Render Server             ║`);
  console.log(`╠══════════════════════════════════════════╣`);
  console.log(`║   🌐 Port: ${PORT}                       ║`);
  console.log(`║   📝 Environment: ${process.env.NODE_ENV || 'production'} ║`);
  console.log(`║   ✅ Server ready!                       ║`);
  console.log(`╚══════════════════════════════════════════╝`);
});

