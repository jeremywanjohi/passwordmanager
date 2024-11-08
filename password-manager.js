// password-manager.js

const { initKeychain } = require('./src/init');
const { setEntry } = require('./src/set');
const { getEntry } = require('./src/get');
const { dumpKeychain } = require('./src/dump');
const { loadKeychain } = require('./src/load');
const { removeEntry } = require('./src/remove'); // Ensure this exists
const { clear } = require('./src/utils/kvs'); // Ensure this exists

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
        await setEntry(domain, password);
    }

    /**
     * Retrieves the password for a given domain.
     * @param {string} domain 
     * @returns {string} - The decrypted password.
     */
    async get(domain) {
        return await getEntry(domain);
    }

    /**
     * Removes the password for a given domain.
     * @param {string} domain 
     */
    async remove(domain) {
        await removeEntry(domain);
    }

    /**
     * Dumps the keychain to a specified file.
     * @param {string} filepath 
     */
    async dump(filepath) {
        await dumpKeychain(filepath);
    }

    /**
     * Loads the keychain from a specified file.
     * @param {string} filepath 
     */
    async load(filepath) {
        await loadKeychain(filepath);
    }

    /**
     * Clears the in-memory key-value store.
     */
    clear() {
        clear();
    }
}

module.exports = Keychain;
