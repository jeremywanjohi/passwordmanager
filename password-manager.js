// password-manager.js
const { initKeychain } = require('./src/init');
const { setEntry } = require('./src/set');
const { getEntry } = require('./src/get');
const { dumpKeychain } = require('./src/dump');
// ... other imports as modules are implemented

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
     * Dumps the keychain to a specified file.
     * @param {string} filepath 
     */
    async dump(filepath) {
        await dumpKeychain(filepath);
    }

    // Placeholder for other methods (load, remove)
}

module.exports = Keychain;
