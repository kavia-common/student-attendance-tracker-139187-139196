'use strict';
const { getRepository } = require('../services/db');

class ReportsController {
  // PUBLIC_INTERFACE
  async summary(req, res, next) {
    /** Generate attendance summary for a date range and optional studentId. */
    try {
      const { from, to, studentId } = req.query || {};
      const repo = getRepository();
      const data = await repo.attendanceSummary({ from, to, studentId });
      res.json({ status: 'ok', data });
    } catch (e) { next(e); }
  }
}

module.exports = new ReportsController();
