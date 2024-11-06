// src/load.js
const fs = require('fs').promises;
const { verifyChecksum } = require('./utils/checksum');
const { setEntry } = require('./set');
const KeyValueStore = require('./utils/kvs');

/**
 * Loads the keychain data from a JSON file.
 * @param {string} filepath - The path to the input file.
 */
async function loadKeychain(filepath) {
    const fileContent = await fs.readFile(filepath, 'utf8');
    const dumpData = JSON.parse(fileContent);

    const { checksum, data } = dumpData;

    const serializedData = JSON.stringify(data);
    const isValid = verifyChecksum(serializedData, checksum);

    if (!isValid) {
        throw new Error('Checksum verification failed. Data may be corrupted.');
    }

    // Clear existing KVS and load new entries
    KeyValueStore.getInstance().clear();

    for (const [domainHMAC, entry] of Object.entries(data)) {
        KeyValueStore.getInstance().set(domainHMAC, entry);
    }

    // Optionally, handle protection against record count leakage here
}

module.exports = {
    loadKeychain
};
