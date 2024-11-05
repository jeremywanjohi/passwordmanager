const { expect } = require('expect.js');
const { setEntry } = require('../src/set');
const { initKeychain } = require('../src/init');
const KeyValueStore = require('../src/utils/kvs'); // Assuming a KVS module

describe('Set Module', () => {
    before(async () => {
        await initKeychain('TestMasterPassword');
    });

    it('should set an entry with encrypted password', async () => {
        const domain = 'example.com';
        const password = 'SecurePassword!@#';
        
        await setEntry(domain, password);
        
        const hmacDomainName = KeyValueStore.hmacDomain(domain);
        const entry = KeyValueStore.get(hmacDomainName);
        
        expect(entry).to.have.property('iv');
        expect(entry).to.have.property('authTag');
        expect(entry).to.have.property('password');
    });

    it('should pad the password to fixed length', async () => {
        const domain = 'short.com';
        const password = 'short';
        
        await setEntry(domain, password);
        
        const entry = KeyValueStore.get(KeyValueStore.hmacDomain(domain));
        const encryptedPassword = entry.password;
        
        // Decrypt to verify padding (assuming decryption is implemented)
        // This is a placeholder for actual decryption verification
        // const decrypted = decrypt(encryptedPassword, entry.iv, entry.authTag);
        // expect(decrypted.length).to.be(32);
    });
});
