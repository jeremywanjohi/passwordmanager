const crypto = require('crypto');
const { getCachedKey } = require('./init');
const { hmacDomain } = require('./utils/hashing');
const { padPassword } = require('./utils/encryption');

const PASSWORD_LENGTH = 32; // Fixed password length after padding

/**
 * Sets a password entry for a given domain.
 * @param {string} domain - The domain name.
 * @param {string} password - The password to store.
 */
async function setEntry(domain, password) {
    const key = getCachedKey();
    if (!key) {
        throw new Error('Keychain not initialized');
    }

    const iv = crypto.randomBytes(12); // AES-GCM standard IV size
    const hmacDomainName = hmacDomain(domain);

    const paddedPassword = padPassword(password, PASSWORD_LENGTH);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(paddedPassword, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Store the encrypted password along with IV and auth tag
    const entry = {
        iv: iv.toString('hex'),
        authTag,
        password: encrypted
    };

    // Initialize or update the Key-Value Store (KVS)
    // This is a placeholder; actual KVS implementation may vary
    const kvs = KeyValueStore.getInstance();
    kvs.set(hmacDomainName, entry);
}

module.exports = {
    setEntry
};
