 
const { expect } = require('expect.js');
const { setEntry } = require('../src/set');
const { getEntry } = require('../src/get');
const { initKeychain } = require('../src/init');
const KeyValueStore = require('../src/utils/kvs'); // Assuming a KVS module

describe('Get Module', () => {
    before(async () => {
        await initKeychain('TestMasterPassword');
    });

    it('should retrieve and decrypt the password for a domain', async () => {
        const domain = 'example.com';
        const password = 'SecurePassword!@#';

        await setEntry(domain, password);
        const retrievedPassword = await getEntry(domain);

        expect(retrievedPassword).to.be(password);
    });

    it('should throw an error if the domain does not exist', async () => {
        try {
            await getEntry('nonexistent.com');
        } catch (error) {
            expect(error.message).to.be('No entry found for the specified domain');
        }
    });

    it('should handle padded passwords correctly', async () => {
        const domain = 'padding.com';
        const password = 'short';

        await setEntry(domain, password);
        const retrievedPassword = await getEntry(domain);

        expect(retrievedPassword).to.be('short');
    });
});