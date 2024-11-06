// test/load.test.js

const { expect } = require('chai');
const fs = require('fs').promises;
const { loadKeychain } = require('../src/load');
const { dumpKeychain } = require('../src/dump');
const { setEntry } = require('../src/set');
const { clear, getAllEntries } = require('../src/utils/kvs'); // Import getAllEntries for verification
const { getEntry } = require('../src/get');

describe("Load Module", () => {
    const filepath = 'test_dump.json';

    before(async () => {
        // Clear KVS and set up initial entries
        clear();
        setEntry('example.com', 'password123');
        setEntry('test.com', 'password456');

        // Ensure that dumpKeychain is called and awaited
        await dumpKeychain(filepath);
    });

    it("should load the keychain from a JSON file and verify checksum", async () => {
        // Clear the KVS to simulate loading fresh data
        clear();

        // Load the keychain from the file
        await loadKeychain(filepath);

        // Verify that the entries are correctly loaded
        const password1 = getEntry('example.com');
        const password2 = getEntry('test.com');

        expect(password1).to.equal('password123');
        expect(password2).to.equal('password456');
    });

    after(async () => {
        // Clean up test file and key-value store
        try {
            await fs.unlink(filepath);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
        clear();
    });
});
