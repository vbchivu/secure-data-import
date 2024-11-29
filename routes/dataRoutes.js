// routes/dataRoutes.js

/**
 * @swagger
 * tags:
 *   name: Data
 *   description: Manage permissions and import data from remote databases
 */

/**
 * @swagger
 * /data/set-permissions:
 *   post:
 *     summary: Set user permissions for accessing specific tables
 *     tags:
 *       - Data
 *     security:
 *       - bearerAuth: []  # Requires JWT authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tables
 *             properties:
 *               tables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of table names the user is permitted to access.
 *                 example: ["employees"]
 *     responses:
 *       200:
 *         description: Permissions updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissions updated successfully
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["employees"]
 *       400:
 *         description: Validation errors in the provided data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: Tables must be a non-empty array
 *                       param:
 *                         type: string
 *                         example: tables
 *                       location:
 *                         type: string
 *                         example: body
 *       500:
 *         description: Internal server error while updating permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating permissions
 *                 error:
 *                   type: string
 *                   example: Database query failed
 */

/**
 * @swagger
 * /data/import-data/{tableName}:
 *   post:
 *     summary: Import data from a remote table into the application database
 *     tags:
 *       - Data
 *     security:
 *       - bearerAuth: []  # Requires JWT authentication
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the remote table to import data from.
 *     responses:
 *       200:
 *         description: Data imported successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data imported successfully
 *                 importedRows:
 *                   type: integer
 *                   example: 25
 *       403:
 *         description: User does not have permission to access this table.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied to this table
 *       404:
 *         description: No data found in the remote table.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No data found in remote table
 *       500:
 *         description: Internal server error while importing data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error importing data
 *                 error:
 *                   type: string
 *                   example: Database query failed
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { setPermissions, importData } = require('../controllers/dataController');
const { check } = require('express-validator');

const router = express.Router();

// Set permissions endpoint with input validation
router.post(
    '/set-permissions',
    authenticateToken,
    [
        check('tables').isArray({ min: 1 }).withMessage('Tables must be a non-empty array'),
        check('tables.*').isString().withMessage('Each table name must be a string'),
    ],
    setPermissions
);

// Import data endpoint
router.post('/import-data/:tableName', authenticateToken, importData);

module.exports = router;
