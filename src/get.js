// src/get.js
const crypto = require('crypto');
const { get } = require('./utils/kvs');
const { hmacDomain } = require('./utils/hashing');
const { unpadPassword } = require('./utils/padding');
const { getMasterKey } = require('./init'); // Correctly import getMasterKey

/**
 * Retrieves and decrypts the password for a given domain.
 * @param {string} domain - The domain name.
 * @returns {string} The decrypted password.
 */
function getEntry(domain) {
    if (typeof domain !== 'string') {
        throw new Error('Domain must be a string.');
    }

    // Generate HMAC for the domain using the master key
    const domainHMAC = hmacDomain(domain, getMasterKey());

    // Retrieve the encrypted password from KVS
    const encryptedPassword = get(domainHMAC);
    if (!encryptedPassword) {
        throw new Error('Domain does not exist');
    }

    const { iv, authTag, ciphertext } = encryptedPassword;

    // Decrypt the password using AES-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', getMasterKey(), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Unpad the decrypted password
    const unpaddedPassword = unpadPassword(decrypted);

    return unpaddedPassword;
}

module.exports = {
    getEntry
};
