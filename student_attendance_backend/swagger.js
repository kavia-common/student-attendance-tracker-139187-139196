const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Attendance Tracker API',
      version: '1.0.0',
      description:
        'Express API for managing students, attendance records, authentication, and reports. ' +
        'Set JWT_SECRET and DB_* env vars to enable JWT and database access. ' +
        'OpenAPI served at /openapi.json and docs at /docs.',
      contact: { name: 'Student Attendance', url: 'https://example.com' }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
