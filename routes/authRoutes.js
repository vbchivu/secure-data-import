// routes/authRoutes.js

const express = require('express');
const { register, login } = require('../controllers/authController');
const { check } = require('express-validator');

const router = express.Router();

// Registration endpoint with input validation
router.post(
    '/register',
    [
        check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    register
);

// Login endpoint with input validation
router.post(
    '/login',
    [
        check('username').notEmpty().withMessage('Username is required'),
        check('password').notEmpty().withMessage('Password is required'),
    ],
    login
);

module.exports = router;
