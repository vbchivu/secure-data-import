// routes/connectionRoutes.js

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
