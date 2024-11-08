// src/remove.js

const { remove } = require('./utils/kvs');
const { hmacDomain } = require('./utils/hashing');
const { getMasterKey } = require('./init');

/**
 * Removes the password entry for a given domain.
 * @param {string} domain - The domain name.
 */
function removeEntry(domain) {
    if (typeof domain !== 'string') {
        throw new Error('Domain must be a string.');
    }

    const domainHMAC = hmacDomain(domain, getMasterKey());
    remove(domainHMAC);
}

module.exports = {
    removeEntry
};
