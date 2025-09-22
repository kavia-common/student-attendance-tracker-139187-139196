'use strict';
/**
 * Database service: Provides a simple repository interface with an in-memory fallback.
 * If DB_* env vars are provided, uses Knex to connect to the student_attendance_database.
 */
const knexFactory = require('knex');

function getKnexConfigFromEnv() {
  const client = process.env.DB_CLIENT || null;
  if (!client) return null;
  const ssl = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';
  return {
    client,
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: ssl ? { rejectUnauthorized: false } : false,
    },
    pool: { min: 0, max: 10 },
    migrations: { tableName: 'knex_migrations' },
  };
}

class InMemoryRepo {
  constructor() {
    this.students = new Map(); // id -> student
    this.attendance = new Map(); // id -> attendance record
    this._studentSeq = 1;
    this._attendanceSeq = 1;
    // demo admin user
    this.users = [{ id: 1, email: 'admin@example.com', passwordHash: null, role: 'admin' }];
  }

  async init() {
    return true;
  }

  // Students
  async listStudents() {
    return Array.from(this.students.values());
  }
  async getStudent(id) {
    return this.students.get(Number(id)) || null;
  }
  async createStudent(data) {
    const id = this._studentSeq++;
    const record = { id, name: data.name, rollNumber: data.rollNumber, className: data.className || null, section: data.section || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.students.set(id, record);
    return record;
  }
  async updateStudent(id, data) {
    id = Number(id);
    const existing = this.students.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.students.set(id, updated);
    return updated;
  }
  async deleteStudent(id) {
    id = Number(id);
    return this.students.delete(id);
  }

  // Attendance
  async listAttendance(filter = {}) {
    const items = Array.from(this.attendance.values());
    return items.filter(a => {
      if (filter.studentId && Number(filter.studentId) !== a.studentId) return false;
      if (filter.date && filter.date !== a.date) return false;
      if (filter.status && filter.status !== a.status) return false;
      return true;
    });
  }
  async getAttendance(id) {
    return this.attendance.get(Number(id)) || null;
  }
  async createAttendance(data) {
    const id = this._attendanceSeq++;
    const record = {
      id,
      studentId: Number(data.studentId),
      date: data.date, // YYYY-MM-DD
      status: data.status, // 'present' | 'absent' | 'late' | 'excused'
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.attendance.set(id, record);
    return record;
  }
  async updateAttendance(id, data) {
    id = Number(id);
    const existing = this.attendance.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.attendance.set(id, updated);
    return updated;
  }
  async deleteAttendance(id) {
    id = Number(id);
    return this.attendance.delete(id);
  }

  // Reports
  async attendanceSummary({ from, to, studentId }) {
    const list = await this.listAttendance({ studentId });
    const inRange = list.filter(a => (!from || a.date >= from) && (!to || a.date <= to));
    const summary = { total: inRange.length, present: 0, absent: 0, late: 0, excused: 0 };
    for (const r of inRange) {
      if (summary[r.status] !== undefined) summary[r.status] += 1;
    }
    return summary;
  }
}

class KnexRepo extends InMemoryRepo {
  constructor(knex) {
    super();
    this.knex = knex;
  }
  async init() {
    // Create tables if not exist (simple bootstrap)
    const hasStudents = await this.knex.schema.hasTable('students');
    if (!hasStudents) {
      await this.knex.schema.createTable('students', t => {
        t.increments('id').primary();
        t.string('name').notNullable();
        t.string('rollNumber').notNullable().unique();
        t.string('className');
        t.string('section');
        t.timestamp('createdAt').defaultTo(this.knex.fn.now());
        t.timestamp('updatedAt').defaultTo(this.knex.fn.now());
      });
    }
    const hasAttendance = await this.knex.schema.hasTable('attendance');
    if (!hasAttendance) {
      await this.knex.schema.createTable('attendance', t => {
        t.increments('id').primary();
        t.integer('studentId').notNullable().references('id').inTable('students').onDelete('CASCADE');
        t.date('date').notNullable();
        t.string('status').notNullable();
        t.text('notes');
        t.timestamp('createdAt').defaultTo(this.knex.fn.now());
        t.timestamp('updatedAt').defaultTo(this.knex.fn.now());
        t.unique(['studentId', 'date']); // one record per day per student
      });
    }
    const hasUsers = await this.knex.schema.hasTable('users');
    if (!hasUsers) {
      await this.knex.schema.createTable('users', t => {
        t.increments('id').primary();
        t.string('email').notNullable().unique();
        t.string('passwordHash').notNullable();
        t.string('role').defaultTo('teacher');
        t.timestamp('createdAt').defaultTo(this.knex.fn.now());
        t.timestamp('updatedAt').defaultTo(this.knex.fn.now());
      });
    }
    return true;
  }

  // Students
  async listStudents() {
    return this.knex('students').select('*').orderBy('id', 'asc');
  }
  async getStudent(id) {
    const row = await this.knex('students').where({ id }).first();
    return row || null;
  }
  async createStudent(data) {
    const [row] = await this.knex('students')
      .insert({ name: data.name, rollNumber: data.rollNumber, className: data.className || null, section: data.section || null })
      .returning('*');
    return row;
  }
  async updateStudent(id, data) {
    const [row] = await this.knex('students')
      .where({ id })
      .update({ ...data, updatedAt: this.knex.fn.now() })
      .returning('*');
    return row || null;
  }
  async deleteStudent(id) {
    const count = await this.knex('students').where({ id }).del();
    return count > 0;
  }

  // Attendance
  async listAttendance(filter = {}) {
    let q = this.knex('attendance').select('*').orderBy('date', 'desc').orderBy('id', 'desc');
    if (filter.studentId) q = q.where({ studentId: Number(filter.studentId) });
    if (filter.date) q = q.where({ date: filter.date });
    if (filter.status) q = q.where({ status: filter.status });
    return q;
  }
  async getAttendance(id) {
    const row = await this.knex('attendance').where({ id }).first();
    return row || null;
  }
  async createAttendance(data) {
    const [row] = await this.knex('attendance')
      .insert({ studentId: Number(data.studentId), date: data.date, status: data.status, notes: data.notes || null })
      .returning('*');
    return row;
  }
  async updateAttendance(id, data) {
    const [row] = await this.knex('attendance')
      .where({ id })
      .update({ ...data, updatedAt: this.knex.fn.now() })
      .returning('*');
    return row || null;
  }
  async deleteAttendance(id) {
    const count = await this.knex('attendance').where({ id }).del();
    return count > 0;
  }

  // Reports
  async attendanceSummary({ from, to, studentId }) {
    let q = this.knex('attendance').select('status').count('* as count').groupBy('status');
    if (studentId) q = q.where({ studentId: Number(studentId) });
    if (from) q = q.andWhere('date', '>=', from);
    if (to) q = q.andWhere('date', '<=', to);
    const rows = await q;
    const summary = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
    for (const r of rows) {
      summary.total += Number(r.count);
      const key = r.status;
      if (summary[key] !== undefined) summary[key] += Number(r.count);
    }
    return summary;
  }
}

let repoInstance = null;

// PUBLIC_INTERFACE
function getRepository() {
  /** Returns a repository instance. Uses DB if configured, otherwise in-memory. */
  if (repoInstance) return repoInstance;
  const knexConfig = getKnexConfigFromEnv();
  if (knexConfig) {
    const knex = knexFactory(knexConfig);
    repoInstance = new KnexRepo(knex);
    repoInstance.init().catch((e) => {
      console.error('DB init failed, falling back to in-memory:', e.message);
      repoInstance = new InMemoryRepo();
    });
  } else {
    repoInstance = new InMemoryRepo();
  }
  return repoInstance;
}

module.exports = { getRepository };
