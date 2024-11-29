// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Unauthorized access attempt');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.warn('Forbidden access attempt');
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };
