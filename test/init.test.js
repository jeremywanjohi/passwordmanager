// test/init.test.js
const expect = require('expect.js'); // Correct import
const { initKeychain, getCachedKey, getCachedSalt } = require('../src/init');

describe('Initialization Module', () => {
    it('should derive a key using PBKDF2', () => {
        const masterPassword = 'StrongPassword123!';
        const { key, salt } = initKeychain(masterPassword);
        
        expect(key).to.be.a(Buffer);
        expect(key.length).to.be(32);
        expect(salt).to.be.a(Buffer);
        expect(salt.length).to.be(16);
    });

    it('should cache the derived key and salt after initialization', () => {
        const masterPassword = 'AnotherPassword!@#';
        initKeychain(masterPassword);
        
        const cachedKey = getCachedKey();
        const cachedSalt = getCachedSalt();
        
        expect(cachedKey).to.be.a(Buffer);
        expect(cachedSalt).to.be.a(Buffer);
    });

    it('should throw an error if PBKDF2 fails', () => {
        const originalPBKDF2 = crypto.pbkdf2Sync;
        crypto.pbkdf2Sync = () => { throw new Error('PBKDF2 failure'); };

        try {
            initKeychain('test');
        } catch (error) {
            expect(error.message).to.be('Failed to initialize keychain');
        }

        // Restore original function
        crypto.pbkdf2Sync = originalPBKDF2;
    });
});
