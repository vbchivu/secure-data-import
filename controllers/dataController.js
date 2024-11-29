// controllers/dataController.js

const { fetchData } = require('../services/sshService');
const { getAppDbConnection } = require('../services/dbService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const setPermissions = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation errors: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({ errors: errors.array() });
    }

    const { tables } = req.body;
    const userId = req.user.userId;

    let db;
    try {
        db = await getAppDbConnection();

        // Update user's permissions
        await db.query('UPDATE users SET permissions = ? WHERE id = ?', [JSON.stringify(tables), userId]);

        logger.info(`Permissions updated for user ${userId}: ${tables.join(', ')}`);

        res.json({ message: 'Permissions updated successfully', permissions: tables });
    } catch (error) {
        logger.error(`Error updating permissions: ${error.message}`);
        res.status(500).json({ message: 'Error updating permissions', error: error.message });
    }
};

const importData = async (req, res) => {
    const { tableName } = req.params;
    const userId = req.user.userId;

    let db;
    try {
        db = await getAppDbConnection();

        // Get user permissions
        const [users] = await db.query('SELECT permissions FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            logger.warn(`User not found: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const permissions = JSON.parse(user.permissions || '[]');

        // Check if user has permission for the table
        if (!permissions.includes(tableName)) {
            logger.warn(`Access denied to table ${tableName} for user ${userId}`);
            return res.status(403).json({ message: 'Access denied to this table' });
        }

        // Fetch data from remote database
        const remoteData = await fetchData(tableName);

        if (remoteData.length === 0) {
            logger.info(`No data found in remote table ${tableName}`);
            return res.status(404).json({ message: 'No data found in remote table' });
        }

        // Extract columns from remote data
        const columns = Object.keys(remoteData[0]);

        // Calculate the number of placeholders per row (user_id + number of columns)
        const numPlaceholdersPerRow = columns.length + 1; // +1 for user_id

        // Generate placeholders for a single row
        const placeholdersPerRow = '(' + new Array(numPlaceholdersPerRow).fill('?').join(', ') + ')';

        // Generate placeholders for all rows
        const placeholders = remoteData.map(() => placeholdersPerRow).join(', ');

        // Prepare the values array
        const values = [];
        for (const row of remoteData) {
            values.push(userId, ...Object.values(row));
        }

        // Start Transaction
        await db.beginTransaction();

        await db.query(
            `INSERT INTO ?? (user_id, ${columns.join(', ')}) VALUES ${placeholders}`,
            [tableName, ...values]
        );

        // Commit Transaction
        await db.commit();

        logger.info(`Data imported into table ${tableName} for user ${userId}`);

        res.json({ message: 'Data imported successfully', importedRows: remoteData.length });
    } catch (error) {
        if (db) await db.rollback();
        logger.error(`Error importing data: ${error.message}`);
        res.status(500).json({ message: 'Error importing data', error: error.message });
    } finally {
        if (db) await db.end();
    }
};

module.exports = { setPermissions, importData };
