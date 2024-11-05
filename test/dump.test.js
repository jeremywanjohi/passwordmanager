 // test/dump.test.js
const { expect } = require('expect.js');
const { dumpKeychain } = require('../src/dump');
const { initKeychain } = require('../src/init');
const { setEntry } = require('../src/set');
const KeyValueStore = require('../src/utils/kvs');
const fs = require('fs').promises;
const path = require('path');

describe('Dump Module', () => {
    const dumpFilePath = path.join(__dirname, 'test_dump.json');

    before(async () => {
        await initKeychain('TestMasterPassword');
        await setEntry('example.com', 'Password123');
    });

    after(async () => {
        // Clean up the dump file after tests
        try {
            await fs.unlink(dumpFilePath);
        } catch (error) {
            // File might not exist; ignore
        }
    });

    it('should dump the keychain to a JSON file with checksum', async () => {
        await dumpKeychain(dumpFilePath);
        const fileContent = await fs.readFile(dumpFilePath, 'utf8');
        const dumpData = JSON.parse(fileContent);

        expect(dumpData).to.have.property('checksum');
        expect(dumpData).to.have.property('data');
        expect(dumpData.data).to.have.property(KeyValueStore.hmacDomain('example.com'));
    });
});

