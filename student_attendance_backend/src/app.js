const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
require('dotenv').config();

const routes = require('./routes');
const studentsRouter = require('./routes/students');
const attendanceRouter = require('./routes/attendance');
const authRouter = require('./routes/auth');
const reportsRouter = require('./routes/reports');

// Initialize express app
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', true);

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.protocol;
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      { url: `${protocol}://${fullHost}` },
    ],
    tags: [
      { name: 'Health', description: 'Service health checks' },
      { name: 'Auth', description: 'User authentication' },
      { name: 'Students', description: 'Manage students' },
      { name: 'Attendance', description: 'Manage attendance records' },
      { name: 'Reports', description: 'Attendance reporting' },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', routes);
app.use('/login', authRouter);
app.use('/students', studentsRouter);
app.use('/attendance', attendanceRouter);
app.use('/reports', reportsRouter);

/* Error handling middleware: Keep 4-arity signature for Express to treat it as error handler */
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  // Centralized error handler
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err.stack || err);
  }
  res.status(status).json({
    status: 'error',
    message,
    details,
  });
});
/* eslint-enable no-unused-vars */

module.exports = app;
