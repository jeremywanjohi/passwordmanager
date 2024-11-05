const crypto = require('crypto');
const { getCachedKey } = require('./init');
const { hmacDomain } = require('./utils/hashing');
const { unpadPassword } = require('./utils/encryption');

const PASSWORD_LENGTH = 32; // Fixed password length after padding

/**
 * Retrieves and decrypts a password entry for a given domain.
 * @param {string} domain - The domain name.
 * @returns {Promise<string>} - The decrypted password.
 */
async function getEntry(domain) {
    const key = getCachedKey();
    if (!key) {
        throw new Error('Keychain not initialized');
    }

    const hmacDomainName = hmacDomain(domain);
    const kvs = KeyValueStore.getInstance();
    const entry = kvs.get(hmacDomainName);

    if (!entry) {
        throw new Error('No entry found for the specified domain');
    }

    const iv = Buffer.from(entry.iv, 'hex');
    const authTag = Buffer.from(entry.authTag, 'hex');
    const encryptedPassword = entry.password;

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const unpaddedPassword = unpadPassword(decrypted);
    return unpaddedPassword;
}

module.exports = {
    getEntry
}; 
