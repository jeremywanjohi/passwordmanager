// src/set.js
const crypto = require('crypto');
const { set } = require('./utils/kvs');
const { hmacDomain } = require('./utils/hashing');
const { padPassword } = require('./utils/padding');
const { getMasterKey } = require('./init');

/**
 * Sets an entry with an encrypted password.
 * @param {string} domain - The domain name.
 * @param {string} password - The plaintext password.
 */
function setEntry(domain, password) {
    if (typeof domain !== 'string' || typeof password !== 'string') {
        throw new Error('Domain and password must be strings.');
    }

    // Generate HMAC for the domain using the master key
    const domainHMAC = hmacDomain(domain, getMasterKey());

    // Pad the password to a fixed length (e.g., 32 characters)
    const paddedPassword = padPassword(password, 32); // Ensure padPassword accepts length as second argument

    // Encrypt the padded password using AES-GCM
    const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', getMasterKey(), iv);
    let encrypted = cipher.update(paddedPassword, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Store the encrypted password along with IV and authTag
    const encryptedPassword = {
        iv: iv.toString('hex'),
        authTag,
        ciphertext: encrypted
    };

    // Set the entry in the Key-Value Store
    set(domainHMAC, encryptedPassword);
}

module.exports = {
    setEntry
};
