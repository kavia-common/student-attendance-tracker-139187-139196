'use strict';
const express = require('express');
const controller = require('../controllers/attendance');
const { authMiddleware } = require('../services/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Attendance
 *     description: Manage attendance records
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: List attendance
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema: { type: integer }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [present, absent, late, excused] }
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/', authMiddleware, controller.list.bind(controller));

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Mark attendance
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, date, status]
 *             properties:
 *               studentId: { type: integer }
 *               date: { type: string, format: date }
 *               status: { type: string, enum: [present, absent, late, excused] }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Created attendance record
 */
router.post('/', authMiddleware, controller.create.bind(controller));

/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     summary: Get attendance record
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Attendance record
 *       404:
 *         description: Not found
 */
router.get('/:id', authMiddleware, controller.get.bind(controller));

/**
 * @swagger
 * /attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/:id', authMiddleware, controller.update.bind(controller));

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', authMiddleware, controller.remove.bind(controller));

module.exports = router;
