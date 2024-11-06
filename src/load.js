// src/load.js

const fs = require('fs').promises;
const { set } = require('./utils/kvs');
const { createChecksum } = require('./utils/checksum');
const { getMasterKey } = require('./init');
const { hmacDomain } = require('./utils/hashing');

async function loadKeychain(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf8');
        const { checksum, data: entries } = JSON.parse(data);

        // Verify checksum
        const dataString = JSON.stringify(entries);
        const calculatedChecksum = createChecksum(dataString);
        if (checksum !== calculatedChecksum) {
            throw new Error('Checksum verification failed');
        }

        // Load entries into KVS
        for (const domainHMAC in entries) {
            const entry = entries[domainHMAC];
            set(domainHMAC, entry);
        }
    } catch (error) {
        console.error('Error in loadKeychain:', error);
        throw error;
    }
}

module.exports = {
    loadKeychain
};
