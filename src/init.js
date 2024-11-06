// src/init.js
const crypto = require('crypto');

let cachedKey = null;
let cachedSalt = null;

/**
 * Initializes the keychain using PBKDF2.
 * @param {string} masterPassword - The master password provided by the user.
 * @returns {Object} - An object containing the derived key and salt.
 */
function initKeychain(masterPassword) {
    if (cachedKey && cachedSalt) {
        return { key: cachedKey, salt: cachedSalt };
    }

    try {
        const salt = crypto.randomBytes(16);
        const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha256');

        cachedKey = key;
        cachedSalt = salt;

        return { key, salt };
    } catch (error) {
        throw new Error('Failed to initialize keychain');
    }
}

/**
 * Retrieves the cached master key.
 * @returns {Buffer} The master key.
 */
function getMasterKey() {
    if (!cachedKey) {
        throw new Error("Master key not initialized.");
    }
    return cachedKey;
}

/**
 * Retrieves the cached salt.
 * @returns {Buffer} The salt.
 */
function getCachedSalt() {
    if (!cachedSalt) {
        throw new Error("Salt not initialized.");
    }
    return cachedSalt;
}

module.exports = {
    initKeychain,
    getMasterKey,
    getCachedSalt
};
