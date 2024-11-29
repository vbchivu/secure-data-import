// routes/connectionRoutes.js

/**
 * @swagger
 * tags:
 *   name: Connections
 *   description: Manage database and SSH connection details
 */

/**
 * @swagger
 * /connections/add:
 *   post:
 *     summary: Add a new database and SSH connection
 *     tags:
 *       - Connections
 *     security:
 *       - bearerAuth: []  # Requires JWT authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dbHost
 *               - dbPort
 *               - dbUsername
 *               - dbPassword
 *               - dbName
 *               - sshHost
 *               - sshPort
 *               - sshUsername
 *             properties:
 *               dbHost:
 *                 type: string
 *                 description: Hostname or IP of the remote database.
 *                 example: localhost
 *               dbPort:
 *                 type: integer
 *                 description: Port of the remote database.
 *                 example: 3306
 *               dbUsername:
 *                 type: string
 *                 description: Username for the remote database.
 *                 example: remote_user
 *               dbPassword:
 *                 type: string
 *                 description: Password for the remote database.
 *                 example: remote_password
 *               dbName:
 *                 type: string
 *                 description: Name of the remote database.
 *                 example: user_remote_db
 *               sshHost:
 *                 type: string
 *                 description: Hostname or IP of the SSH server.
 *                 example: host.docker.internal
 *               sshPort:
 *                 type: integer
 *                 description: Port for the SSH server.
 *                 example: 22
 *               sshUsername:
 *                 type: string
 *                 description: Username for the SSH connection.
 *                 example: <your_user>
 *     responses:
 *       200:
 *         description: Connection details added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection details added successfully
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
 *                         example: Database host is required
 *                       param:
 *                         type: string
 *                         example: dbHost
 *                       location:
 *                         type: string
 *                         example: body
 *       500:
 *         description: Internal server error while adding connection details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error adding connection
 *                 error:
 *                   type: string
 *                   example: Database query failed
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { addConnection } = require('../controllers/connectionController');
const { check } = require('express-validator');

const router = express.Router();

router.post(
    '/add',
    authenticateToken,
    [
        check('dbHost').notEmpty().withMessage('Database host is required'),
        check('dbPort').isInt().withMessage('Database port must be an integer'),
        check('dbUsername').notEmpty().withMessage('Database username is required'),
        check('dbPassword').notEmpty().withMessage('Database password is required'),
        check('dbName').notEmpty().withMessage('Database name is required'),
        check('sshHost').notEmpty().withMessage('SSH host is required'),
        check('sshPort').notEmpty().withMessage('SSH port is required'),
        check('sshUsername').notEmpty().withMessage('SSH username is required'),
    ],
    addConnection
);

module.exports = router;
