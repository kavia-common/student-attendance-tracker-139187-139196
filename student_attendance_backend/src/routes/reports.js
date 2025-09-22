'use strict';
const express = require('express');
const controller = require('../controllers/reports');
const { authMiddleware } = require('../services/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Attendance reporting
 */

/**
 * @swagger
 * /reports/summary:
 *   get:
 *     summary: Attendance summary
 *     description: Get attendance summary counts for a date range and optional studentId.
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: studentId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Summary
 */
router.get('/summary', authMiddleware, controller.summary.bind(controller));

module.exports = router;
