const healthService = require('../services/health');
const { getRepository } = require('../services/db');

class HealthController {
  // PUBLIC_INTERFACE
  check(req, res) {
    /**
     * Health check with DB connectivity status.
     * Returns: { status, message, timestamp, environment, database: { mode, connected, error? } }
     */
    const healthStatus = healthService.getStatus();
    try {
      const repo = getRepository();
      // repo.knex exists if DB is configured; attempt a lightweight check
      healthStatus.database = {
        mode: repo.knex ? 'database' : 'in-memory',
        connected: !!repo.knex,
      };
    } catch (e) {
      healthStatus.database = {
        mode: 'unknown',
        connected: false,
        error: e.message,
      };
    }
    return res.status(200).json(healthStatus);
  }
}

module.exports = new HealthController();
