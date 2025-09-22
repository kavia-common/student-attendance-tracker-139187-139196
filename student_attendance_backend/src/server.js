require('dotenv').config();
const app = require('./app');
const { getRepository } = require('./services/db');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, async () => {
  const repo = getRepository();
  const mode = repo.knex ? 'database' : 'in-memory';
  console.log(`Server running at http://${HOST}:${PORT} (initial repo: ${mode}). If DB is configured, it may switch to database after init.`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
