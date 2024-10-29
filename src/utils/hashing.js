 
// src/utils/hashing.js
const crypto = require('crypto');

/**
 * Generates an HMAC for a given domain name using a secret key.
 * @param {string} domain - The domain name to hash.
 * @returns {string} - The hexadecimal representation of the HMAC.
 */
function hmacDomain(domain) {
    const secret = getHmacSecret(); // Retrieve secret key from secure storage
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(domain);
    return hmac.digest('hex');
}

/**
 * Retrieves the HMAC secret key.
 * @returns {Buffer} - The secret key.
 */
function getHmacSecret() {
    // This should securely retrieve the secret key, possibly from environment variables or secure storage
    // For simplicity, using a hardcoded key (Not recommended for production)
    return Buffer.from('supersecretkey1234567890abcdef', 'utf-8');
}

module.exports = {
    hmacDomain
};
