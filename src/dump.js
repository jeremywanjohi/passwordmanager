// src/dump.js

const fs = require('fs').promises;
const { getAllEntries } = require('./utils/kvs');
const { createChecksum } = require('./utils/checksum');

/**
 * Dumps the keychain data to a JSON file.
 * @param {string} filepath - The path to the output file.
 */
async function dumpKeychain(filepath) {
    const entries = getAllEntries(); // Retrieve all entries from the KVS
    const dataString = JSON.stringify(entries);
    const checksum = createChecksum(dataString);

    const dumpData = {
        checksum,
        data: entries
    };

    // Write the dump data to the specified file
    await fs.writeFile(filepath, JSON.stringify(dumpData, null, 2), 'utf8');
}

module.exports = {
    dumpKeychain
};
