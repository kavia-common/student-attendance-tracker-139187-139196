'use strict';
const { getRepository } = require('../services/db');

class StudentsController {
  // PUBLIC_INTERFACE
  async list(req, res, next) {
    /** List all students. */
    try {
      const repo = getRepository();
      const students = await repo.listStudents();
      res.json({ status: 'ok', data: students });
    } catch (e) { next(e); }
  }

  // PUBLIC_INTERFACE
  async get(req, res, next) {
    /** Get a student by id. */
    try {
      const repo = getRepository();
      const student = await repo.getStudent(req.params.id);
      if (!student) return res.status(404).json({ status: 'error', message: 'Student not found' });
      res.json({ status: 'ok', data: student });
    } catch (e) { next(e); }
  }

  // PUBLIC_INTERFACE
  async create(req, res, next) {
    /** Create a student. */
    try {
      const { name, rollNumber, className, section } = req.body || {};
      if (!name || !rollNumber) {
        const err = new Error('name and rollNumber are required');
        err.status = 400;
        throw err;
      }
      const repo = getRepository();
      const created = await repo.createStudent({ name, rollNumber, className, section });
      res.status(201).json({ status: 'ok', data: created });
    } catch (e) { next(e); }
  }

  // PUBLIC_INTERFACE
  async update(req, res, next) {
    /** Update a student by id. */
    try {
      const repo = getRepository();
      const updated = await repo.updateStudent(req.params.id, req.body || {});
      if (!updated) return res.status(404).json({ status: 'error', message: 'Student not found' });
      res.json({ status: 'ok', data: updated });
    } catch (e) { next(e); }
  }

  // PUBLIC_INTERFACE
  async remove(req, res, next) {
    /** Delete a student by id. */
    try {
      const repo = getRepository();
      const ok = await repo.deleteStudent(req.params.id);
      if (!ok) return res.status(404).json({ status: 'error', message: 'Student not found' });
      res.json({ status: 'ok', message: 'Deleted' });
    } catch (e) { next(e); }
  }
}

module.exports = new StudentsController();
