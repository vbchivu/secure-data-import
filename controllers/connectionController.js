// controllers/connectionController.js

const { getAppDbConnection } = require('../services/dbService');
const { encrypt, decrypt } = require('../utils/encryption');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');

const addConnection = async (req, res) => {
    const userId = req.user.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation errors: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({ errors: errors.array() });
    }

    const { dbHost, dbPort, dbUsername, dbPassword, dbName, sshHost, sshPort, sshUsername } = req.body;
    let db;
    try {
        db = await getAppDbConnection();

        // Encrypt the database password
        const encryptedPassword = encrypt(dbPassword);

        // Insert connection details into the database
        await db.query(
            'INSERT INTO connections (user_id, db_host, db_port, db_username, db_password, db_name, ssh_host, ssh_port, ssh_username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, dbHost, dbPort, dbUsername, encryptedPassword, dbName, sshHost, sshPort, sshUsername]
        );

        logger.info(`Connection details added for user ${userId}`);

        res.json({ message: 'Connection details added successfully' });
    } catch (error) {
        logger.error(`Error adding connection: ${error.message}`);
        res.status(500).json({ message: 'Error adding connection', error: error.message });
    } finally {
        if (db) await db.end();
    }
};

module.exports = { addConnection };
