// services/sshService.js

const fs = require('fs');
const { Client } = require('ssh2');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { logger } = require('../utils/logger');

async function fetchData(tableName) {
    return new Promise((resolve, reject) => {
        const sshClient = new Client();

        sshClient.on('ready', () => {
            sshClient.forwardOut(
                '127.0.0.1',
                0,
                process.env.REMOTE_DB_HOST,
                process.env.REMOTE_DB_PORT,
                async (err, stream) => {
                    if (err) {
                        sshClient.end();
                        logger.error(`SSH forwardOut error: ${err.message}`);
                        return reject(err);
                    }

                    try {
                        const dbConnection = await mysql.createConnection({
                            host: 'localhost',
                            user: process.env.REMOTE_DB_USERNAME,
                            password: process.env.REMOTE_DB_PASSWORD,
                            database: process.env.REMOTE_DB_NAME,
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

        sshClient.connect({
            host: process.env.SSH_HOST,
            port: process.env.SSH_PORT,
            username: process.env.SSH_USERNAME,
            privateKey: fs.readFileSync(process.env.SSH_PRIVATE_KEY_PATH),
        });
    });
}

module.exports = { fetchData };
