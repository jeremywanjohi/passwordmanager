 // src/utils/checksum.js

const crypto = require('crypto');

/**
 * Generates a SHA-256 checksum for given data.
 * @param {string} data - The data to checksum.
 * @returns {string} - The hexadecimal representation of the checksum.
 */
function generateChecksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verifies the checksum of the given data.
 * @param {string} data - The original data.
 * @param {string} checksum - The checksum to verify against.
 * @returns {boolean} - True if checksum matches, else false.
 */
function verifyChecksum(data, checksum) {
    const generatedChecksum = generateChecksum(data);
    return generatedChecksum === checksum;
}

module.exports = { generateChecksum, verifyChecksum };
