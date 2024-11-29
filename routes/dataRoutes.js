// routes/dataRoutes.js

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
