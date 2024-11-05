 
// src/load.js

const fs = require('fs').promises;
const path = require('path');
const { verifyChecksum } = require('./utils/checksum');

// Path to the keychain storage file
const KEYCHAIN_PATH = path.join(__dirname, '../keychain.json');
const CHECKSUM_PATH = path.join(__dirname, '../checksum.txt');

/**
 * Loads the keychain from a specified file after verifying checksum.
 * @param {string} filepath 
 * @returns {Object} - The loaded keychain data.
 */
async function loadKeychain(filepath) {
    try {
        const [data, checksum] = await Promise.all([
            fs.readFile(filepath, 'utf-8'),
            fs.readFile(CHECKSUM_PATH, 'utf-8')
        ]);

        if (!verifyChecksum(data, checksum.trim())) {
            throw new Error('Checksum verification failed. Possible rollback attack detected.');
        }

        const keychain = JSON.parse(data);
        // Extract key and salt if stored
        return keychain;
    } catch (error) {
        console.error('Error loading keychain:', error);
        throw error;
    }
}

module.exports = { loadKeychain };
