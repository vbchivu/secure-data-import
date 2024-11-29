// routes/sshKeyRoutes.js

const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { generateSSHKeyPair, getPublicKey, generateInstallScript } = require('../controllers/sshKeyController');

const router = express.Router();

router.post('/generate', authenticateToken, generateSSHKeyPair);
router.get('/public-key', authenticateToken, getPublicKey);
router.get('/install-script', authenticateToken, generateInstallScript);

module.exports = router;
