// test/setup.js
const { initKeychain } = require('../src/init');

// Initialize the keychain before running tests
before(() => {
    initKeychain('secureMasterPassword'); // Use a secure password for testing
});
