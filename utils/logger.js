// utils/logger.js

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure the logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDir, 'application.log') }),
    ],
});

module.exports = { logger };
