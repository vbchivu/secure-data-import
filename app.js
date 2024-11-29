// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const sshKeyRoutes = require('./routes/sshKeyRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const { logger } = require('./utils/logger');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Use Routes
app.use('/auth', authRoutes);
app.use('/data', dataRoutes);
app.use('/ssh-keys', sshKeyRoutes);
app.use('/connections', connectionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
