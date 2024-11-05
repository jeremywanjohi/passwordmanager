 // src/dump.js
const fs = require('fs').promises;
const { hmacDomain } = require('./utils/hashing');
const { initKeychain } = require('./init');
const { getAllEntries } = require('./utils/kvs');
const { createChecksum } = require('./utils/checksum');

/**
 * Dumps the keychain data to a JSON file.
 * @param {string} filepath - The path to the output file.
 */
async function dumpKeychain(filepath) {
    const entries = getAllEntries();
    const serializedEntries = {};

    for (const [domainHMAC, entry] of Object.entries(entries)) {
        serializedEntries[domainHMAC] = entry;
    }

    const data = JSON.stringify(serializedEntries);
    const checksum = createChecksum(data);

    const dumpData = {
        checksum,
        data: serializedEntries
    };

    await fs.writeFile(filepath, JSON.stringify(dumpData, null, 2), 'utf8');
}

module.exports = {
    dumpKeychain
};

