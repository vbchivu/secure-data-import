// services/sshService.js

const { Client } = require('ssh2');
const mysql = require('mysql2/promise');
const { logger } = require('../utils/logger');
const { getAppDbConnection } = require('./dbService');
const { decrypt } = require('../utils/encryption');
require('dotenv').config();

async function fetchData(tableName, userId) {
    let db;
    try {
        db = await getAppDbConnection();

        // Retrieve encrypted private key from database
        const [keys] = await db.query('SELECT private_key FROM ssh_keys WHERE user_id = ?', [userId]);
        if (keys.length === 0) {
            throw new Error('No SSH key pair found for this user');
        }

        // Decrypt private key
        const encryptedPrivateKey = keys[0].private_key;
        const privateKey = decrypt(encryptedPrivateKey);

        // Retrieve the user's connection details
        const [connections] = await db.query('SELECT * FROM connections WHERE user_id = ?', [userId]);
        if (connections.length === 0) {
            throw new Error('No connection details found for this user');
        }

        const connection = connections[0];

        // Decrypt the database password
        const dbPassword = decrypt(connection.db_password);

        const sshClient = new Client();

        return new Promise((resolve, reject) => {
            sshClient.on('ready', () => {
                sshClient.forwardOut(
                    '127.0.0.1',
                    0,
                    connection.db_host,
                    connection.db_port,
                    async (err, stream) => {
                        if (err) {
                            sshClient.end();
                            logger.error(`SSH forwardOut error: ${err.message}`);
                            return reject(err);
                        }

                        try {
                            const dbConnection = await mysql.createConnection({
                                host: 'localhost',
                                user: connection.db_username,
                                password: dbPassword,
                                database: connection.db_name,
                                stream: stream,
                            });

                            const [rows] = await dbConnection.query('SELECT * FROM ??', [tableName]);

                            await dbConnection.end();
                            sshClient.end();

                            resolve(rows);
                        } catch (dbError) {
                            sshClient.end();
                            logger.error(`Database error: ${dbError.message}`);
                            reject(dbError);
                        }
                    }
                );
            });

            sshClient.on('error', (error) => {
                logger.error(`SSH Client Error: ${error.message}`);
                reject(error);
            });

            // Use user-specific SSH parameters
            sshClient.connect({
                host: connection.ssh_host,
                port: connection.ssh_port,
                username: connection.ssh_username,
                privateKey: privateKey,
            });
        });
    } catch (error) {
        if (db) await db.end();
        throw error;
    }
}

module.exports = { fetchData };
