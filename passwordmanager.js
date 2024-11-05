// password-manager.js
const { initKeychain } = require('./src/init');
const { setEntry } = require('./src/set');
const { getEntry } = require('./src/get');
const { dumpKeychain } = require('./src/dump');
const { loadKeychain } = require('./src/load');
const { hmacDomain } = require('./src/utils/hashing'); // Imported hashing utility
const { generateDummyHMAC } = require('./src/utils/security'); // Imported security utility

class Keychain {
    constructor() {
        this.key = null;
        this.salt = null;
    }

    /**
     * Initializes the Keychain with the master password.
     * @param {string} masterPassword 
     */
    async init(masterPassword) {
        const { key, salt } = await initKeychain(masterPassword);
        this.key = key;
        this.salt = salt;
    }

    /**
     * Sets a password for a given domain.
     * @param {string} domain 
     * @param {string} password 
     */
    async set(domain, password) {
        const domainHMAC = hmacDomain(domain, this.key); // Use the key for HMAC
        await setEntry(domainHMAC, password);
    }

    /**
     * Retrieves the password for a given domain.
     * @param {string} domain 
     * @returns {string} - The decrypted password.
     */
    async get(domain) {
        const domainHMAC = hmacDomain(domain, this.key);
        return await getEntry(domainHMAC);
    }

    /**
     * Dumps the keychain to a specified file.
     * @param {string} filepath 
     */
    async dump(filepath) {
        await dumpKeychain(filepath);
    }

    /**
     * Loads the keychain from a specified file after verifying checksum.
     * @param {string} filepath 
     */
    async load(filepath) {
        const keychain = await loadKeychain(filepath);
        this.key = keychain.key;
        this.salt = keychain.salt;
    }

    /**
     * Removes an entry for a given domain.
     * @param {string} domain 
     */
    async remove(domain) {
        const domainHMAC = hmacDomain(domain, this.key);
        await removeEntry(domainHMAC);
    }

    /**
     * Lists all domains stored in the keychain.
     * @returns {Array<string>} - List of domains.
     */
    async listDomains() {
        return await listAllEntries();
    }
}

module.exports = Keychain;
