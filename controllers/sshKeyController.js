// controllers/sshKeyController.js

const crypto = require('crypto');
const { promisify } = require('util');
const { getAppDbConnection } = require('../services/dbService');
const { logger } = require('../utils/logger');
const { encrypt, decrypt } = require('../utils/encryption');
const forge = require('node-forge');

function convertPemToOpenSsh(pemKey) {
    const rsaPublicKey = forge.pki.publicKeyFromPem(pemKey);
    const sshRsaKey = forge.ssh.publicKeyToOpenSSH(rsaPublicKey);
    return sshRsaKey;
}

const generateKeyPairAsync = promisify(crypto.generateKeyPair);

const generateSSHKeyPair = async (req, res) => {
    const userId = req.user.userId;
    let db;
    try {
        db = await getAppDbConnection();

        // Check if key already exists
        const [existingKeys] = await db.query('SELECT * FROM ssh_keys WHERE user_id = ?', [userId]);
        if (existingKeys.length > 0) {
            return res.status(400).json({ message: 'SSH key pair already exists for this user' });
        }

        // Generate SSH key pair
        const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
        });

        // Encrypt private key
        const encryptedPrivateKey = encrypt(privateKey);

        const openSshKey = convertPemToOpenSsh(publicKey);

        // Store encrypted private key and public key in database
        await db.query(
            'INSERT INTO ssh_keys (user_id, private_key, public_key) VALUES (?, ?, ?)',
            [userId, encryptedPrivateKey, openSshKey]
        );

        logger.info(`SSH key pair generated for user ${userId}`);

        res.json({ message: 'SSH key pair generated successfully' });
    } catch (error) {
        logger.error(`Error generating SSH key pair: ${error.message}`);
        res.status(500).json({ message: 'Error generating SSH key pair', error: error.message });
    } finally {
        if (db) await db.end();
    }
};

const getPublicKey = async (req, res) => {
    const userId = req.user.userId;
    let db;
    try {
        db = await getAppDbConnection();

        const [keys] = await db.query('SELECT public_key FROM ssh_keys WHERE user_id = ?', [userId]);
        if (keys.length === 0) {
            return res.status(404).json({ message: 'No SSH key pair found for this user' });
        }

        const publicKey = keys[0].public_key;

        res.json({ publicKey });
    } catch (error) {
        logger.error(`Error retrieving public key: ${error.message}`);
        res.status(500).json({ message: 'Error retrieving public key', error: error.message });
    } finally {
        if (db) await db.end();
    }
};

const generateInstallScript = async (req, res) => {
    const userId = req.user.userId; // Assumes req.user is populated with the authenticated user's data
    let db;
    try {
        db = await getAppDbConnection();

        // Fetch the PEM-formatted public key from the database
        const [keys] = await db.query('SELECT public_key FROM ssh_keys WHERE user_id = ?', [userId]);
        if (keys.length === 0) {
            return res.status(404).json({ message: 'No SSH key pair found for this user' });
        }

        let publicKey = keys[0].public_key;

        // Convert PEM-formatted public key to OpenSSH format if needed
        if (publicKey.startsWith('-----BEGIN')) {
            try {
                publicKey = convertPemToOpenSsh(publicKey);
            } catch (conversionError) {
                logger.error(`Error converting public key to OpenSSH format: ${conversionError.message}`);
                return res.status(500).json({ message: 'Error processing public key', error: conversionError.message });
            }
        }

        // Create the script content with functions to add and remove keys
        const scriptContent = `#!/bin/bash

# Directory and file paths
SSH_DIR="$HOME/.ssh"
AUTHORIZED_KEYS="$SSH_DIR/authorized_keys"

# Ensure .ssh directory exists
mkdir -p $SSH_DIR
chmod 700 $SSH_DIR

# Add public key
add_key() {
    local key="$1"
    if grep -qxF "$key" $AUTHORIZED_KEYS; then
        echo "Public key already exists."
    else
        echo "$key" >> $AUTHORIZED_KEYS
        chmod 600 $AUTHORIZED_KEYS
        echo "Public key added successfully."
    fi
}

# Remove public key
remove_key() {
    local key="$1"
    if grep -qxF "$key" $AUTHORIZED_KEYS; then
        sed -i "/^$key$/d" $AUTHORIZED_KEYS
        echo "Public key removed successfully."
    else
        echo "Public key not found."
    fi
}

# List existing public keys
list_keys() {
    echo "Current authorized keys:"
    cat $AUTHORIZED_KEYS
}

# Main logic to add the provided key
PUBLIC_KEY="${publicKey}"
ACTION="$1" # Can be "add", "remove", or "list"

case "$ACTION" in
    add)
        add_key "$PUBLIC_KEY"
        ;;
    remove)
        remove_key "$PUBLIC_KEY"
        ;;
    list)
        list_keys
        ;;
    *)
        echo "Usage: $0 {add|remove|list}"
        exit 1
        ;;
esac
`;

        // Set headers for script download
        res.setHeader('Content-Disposition', 'attachment; filename="manage_public_keys.sh"');
        res.setHeader('Content-Type', 'text/x-shellscript');
        res.send(scriptContent);
    } catch (error) {
        logger.error(`Error generating install script: ${error.message}`);
        res.status(500).json({ message: 'Error generating install script', error: error.message });
    } finally {
        if (db) await db.end();
    }
};

module.exports = { generateSSHKeyPair, getPublicKey, generateInstallScript };