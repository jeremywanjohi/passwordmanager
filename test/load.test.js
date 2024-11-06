 // test/load.test.js
const { expect } = require('expect.js');
const { dumpKeychain } = require('../src/dump');
const { loadKeychain } = require('../src/load');
const { initKeychain } = require('../src/init');
const { setEntry } = require('../src/set');
const KeyValueStore = require('../src/utils/kvs');
const fs = require('fs').promises;
const path = require('path');

describe('Load Module', () => {
    const dumpFilePath = path.join(__dirname, 'test_dump.json');

    before(async () => {
        await initKeychain('TestMasterPassword');
        await setEntry('example.com', 'Password123');
        await dumpKeychain(dumpFilePath);
        // Clear KVS to test loading
        KeyValueStore.getInstance().clear();
    });

    after(async () => {
        // Clean up the dump file after tests
        try {
            await fs.unlink(dumpFilePath);
        } catch (error) {
            // File might not exist; ignore
        }
    });

    it('should load the keychain from a JSON file and verify checksum', async () => {
        await loadKeychain(dumpFilePath);
        const entry = KeyValueStore.get(KeyValueStore.hmacDomain('example.com'));
        expect(entry).to.have.property('iv');
        expect(entry).to.have.property('authTag');
        expect(entry).to.have.property('password');
    });

    it('should throw an error if checksum verification fails', async () => {
        // Corrupt the dump file
        const corruptedContent = '{"checksum":"invalid","data":{}}';
        await fs.writeFile(dumpFilePath, corruptedContent, 'utf8');

        try {
            await loadKeychain(dumpFilePath);
        } catch (error) {
            expect(error.message).to.be('Checksum verification failed. Data may be corrupted.');
        }
    });
});

