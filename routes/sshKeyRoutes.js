// routes/sshKeyRoutes.js

/**
 * @swagger
 * tags:
 *   name: SSH Keys
 *   description: Manage SSH key pairs for secure connections
 */

/**
 * @swagger
 * /ssh-keys/generate:
 *   post:
 *     summary: Generate a new SSH key pair for the user
 *     tags:
 *       - SSH Keys
 *     security:
 *       - bearerAuth: []  # Requires JWT authentication
 *     responses:
 *       200:
 *         description: SSH key pair generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: SSH key pair generated successfully
 *       400:
 *         description: SSH key pair already exists for this user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: SSH key pair already exists for this user
 *       500:
 *         description: Internal server error during SSH key generation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error generating SSH key pair
 *                 error:
 *                   type: string
 *                   example: Database connection error
 */

/**
 * @swagger
 * /ssh-keys/public-key:
 *   get:
 *     summary: Retrieve the public key for the authenticated user
 *     tags:
 *       - SSH Keys
 *     security:
 *       - bearerAuth: []  # Requires JWT authentication
 *     responses:
 *       200:
 *         description: Public key retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicKey:
 *                   type: string
 *                   description: The public SSH key.
 *                   example: ssh-rsa AAAAB3Nza...
 *       404:
 *         description: No SSH key pair found for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No SSH key pair found for this user
 *       500:
 *         description: Internal server error during public key retrieval.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error retrieving public key
 *                 error:
 *                   type: string
 *                   example: Database query failed
 */

/**
 * @swagger
 * /ssh-keys/install-script:
 *   get:
 *     summary: Generate a script to add, remove, or list public keys on a remote server
 *     tags:
 *       - SSH Keys
 *     security:
 *       - bearerAuth: []  # Requires JWT authentication
 *     responses:
 *       200:
 *         description: Install script generated successfully.
 *         content:
 *           text/x-shellscript:
 *             schema:
 *               type: string
 *               description: The shell script to manage public keys.
 *               example: |
 *                 #!/bin/bash
 *                 mkdir -p ~/.ssh
 *                 chmod 700 ~/.ssh
 *                 echo "ssh-rsa AAAAB3Nza..." >> ~/.ssh/authorized_keys
 *                 chmod 600 ~/.ssh/authorized_keys
 *                 echo "Public key added successfully."
 *       404:
 *         description: No SSH key pair found for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No SSH key pair found for this user
 *       500:
 *         description: Internal server error during script generation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error generating install script
 *                 error:
 *                   type: string
 *                   example: Error processing public key
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { generateSSHKeyPair, getPublicKey, generateInstallScript } = require('../controllers/sshKeyController');

const router = express.Router();

router.post('/generate', authenticateToken, generateSSHKeyPair);
router.get('/public-key', authenticateToken, getPublicKey);
router.get('/install-script', authenticateToken, generateInstallScript);

module.exports = router;
