// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { getAppDbConnection } = require('../services/dbService');
const { logger } = require('../utils/logger');

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation errors: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const db = await getAppDbConnection();

        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            logger.warn(`User registration attempt with existing username: ${username}`);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Insert new user
        const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [
            username,
            hashedPassword,
        ]);

        logger.info(`New user registered: ${username}`);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        logger.error(`Error during registration: ${error.message}`);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation errors: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const db = await getAppDbConnection();

        // Find the user
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];

        if (!user) {
            logger.warn(`Login attempt with invalid username: ${username}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`Invalid password attempt for user: ${username}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        logger.info(`User logged in: ${username}`);

        res.json({ token });
    } catch (error) {
        logger.error(`Error during login: ${error.message}`);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

module.exports = { register, login };
