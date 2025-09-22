'use strict';
const express = require('express');
const controller = require('../controllers/students');
const { authMiddleware } = require('../services/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Manage students
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: List students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/', authMiddleware, controller.list.bind(controller));

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Student
 *       404:
 *         description: Not found
 */
router.get('/:id', authMiddleware, controller.get.bind(controller));

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, rollNumber]
 *             properties:
 *               name: { type: string }
 *               rollNumber: { type: string }
 *               className: { type: string }
 *               section: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authMiddleware, controller.create.bind(controller));

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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
 * /students/{id}:
 *   delete:
 *     summary: Delete student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', authMiddleware, controller.remove.bind(controller));

module.exports = router;
