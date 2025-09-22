'use strict';
const { getRepository } = require('../services/db');

class AttendanceController {
  // PUBLIC_INTERFACE
  async list(req, res, next) {
    /** List attendance records with optional filters. */
    try {
      const { studentId, date, status } = req.query;
      const repo = getRepository();
      const items = await repo.listAttendance({ studentId, date, status });
      res.json({ status: 'ok', data: items });
    } catch (e) { next(e); }
  }

  // PUBLIC_INTERFACE
  async get(req, res, next) {
    /** Get a single attendance record. */
    try {
      const repo = getRepository();
      const item = await repo.getAttendance(req.params.id);
      if (!item) return res.status(404).json({ status: 'error', message: 'Attendance record not found' });
      res.json({ status: 'ok', data: item });
    } catch (e) { next(e); }
  }

  // PUBLIC_INTERFACE
  async create(req, res, next) {
    /** Create/mark attendance. */
    try {
      const { studentId, date, status, notes } = req.body || {};
      if (!studentId || !date || !status) {
        const err = new Error('studentId, date, and status are required');
        err.status = 400;
        throw err;
      }
      const repo = getRepository();
      const created = await repo.createAttendance({ studentId, date, status, notes });
      res.status(201).json({ status: 'ok', data: created });
    } catch (e) { next(e); }
  }

  // PUBLIC_INTERFACE
  async update(req, res, next) {
    /** Update an attendance record. */
    try {
      const repo = getRepository();
      const updated = await repo.updateAttendance(req.params.id, req.body || {});
      if (!updated) return res.status(404).json({ status: 'error', message: 'Attendance record not found' });
      res.json({ status: 'ok', data: updated });
    } catch (e) { next(e); }
  }

  // PUBLIC_INTERFACE
  async remove(req, res, next) {
    /** Delete an attendance record. */
    try {
      const repo = getRepository();
      const ok = await repo.deleteAttendance(req.params.id);
      if (!ok) return res.status(404).json({ status: 'error', message: 'Attendance record not found' });
      res.json({ status: 'ok', message: 'Deleted' });
    } catch (e) { next(e); }
  }
}

module.exports = new AttendanceController();
