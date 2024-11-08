// example.js

const Keychain = require('./password-manager');

(async () => {
    // Create an instance of Keychain
    const keychain = new Keychain();

    // Initialize the keychain with your master password
    await keychain.init('myMasterPassword');

    // Set passwords for domains
    await keychain.set('example.com', 'password123');
    await keychain.set('test.com', 'password456');

    // Retrieve passwords
    const password1 = await keychain.get('example.com');
    console.log(`Password for example.com: ${password1}`);

    const password2 = await keychain.get('test.com');
    console.log(`Password for test.com: ${password2}`);

    // Remove a password
    await keychain.remove('test.com');
    console.log('Removed password for test.com');

    // Try to retrieve a removed password
    try {
        const removedPassword = await keychain.get('test.com');
        console.log(`Password for test.com: ${removedPassword}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }

    // Dump the keychain to a file
    await keychain.dump('my_keychain.json');
    console.log('Keychain dumped to my_keychain.json');

    // Clear the keychain in memory (simulate application restart)
    keychain.clear();

    // Load the keychain from the file
    await keychain.load('my_keychain.json');
    console.log('Keychain loaded from my_keychain.json');

    // Retrieve password after loading
    const loadedPassword = await keychain.get('example.com');
    console.log(`Loaded password for example.com: ${loadedPassword}`);
})();
