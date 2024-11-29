// services/dbService.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function getAppDbConnection() {
    return mysql.createConnection({
        host: process.env.LOCAL_DB_HOST,
        user: process.env.LOCAL_DB_USERNAME,
        password: process.env.LOCAL_DB_PASSWORD,
        database: process.env.LOCAL_DB_NAME,
    });
}

module.exports = { getAppDbConnection };
