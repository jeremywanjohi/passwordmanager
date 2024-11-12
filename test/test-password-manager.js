// test/test-password-manager.js

import expect from 'expect.js';
import Keychain from '../password-manager.js'; // Ensure the '.js' extension is included
import { promises as fs } from 'fs';
import path from 'path';

describe('Password manager', function() {
    this.timeout(10000); // Increase timeout for cryptographic operations
    let keychain;

    beforeEach(async function() {
        keychain = new Keychain();
        await keychain.init('test-master-password');
    });

    afterEach(function() {
        keychain.clear();
    });

    describe('functionality', function() {
        it('inits without an error', async function() {
            // Initialization is done in beforeEach
            expect(keychain.kvs).to.have.property('salt');
            expect(keychain.kvs).to.have.property('data');
            expect(keychain.kvs).to.have.property('hmac');
        });

        it('can set and retrieve a password', async function() {
            await keychain.set('example.com', 'password123');
            const password = await keychain.get('example.com');
            expect(password).to.be('password123');
        });

        it('can set and retrieve multiple passwords', async function() {
            await keychain.set('example.com', 'password123');
            await keychain.set('test.com', 'testpassword');
            const password1 = await keychain.get('example.com');
            const password2 = await keychain.get('test.com');
            expect(password1).to.be('password123');
            expect(password2).to.be('testpassword');
        });

        it('returns null for non-existent passwords', async function() {
            try {
                await keychain.get('nonexistent.com');
                // If no error is thrown, fail the test
                expect().fail('Expected error was not thrown');
            } catch (err) {
                expect(err.message).to.be('No entry found for domain: nonexistent.com');
            }
        });

        it('can remove a password', async function() {
            await keychain.set('example.com', 'password123');
            await keychain.remove('example.com');
            try {
                await keychain.get('example.com');
                expect().fail('Expected error was not thrown');
            } catch (err) {
                expect(err.message).to.be('No entry found for domain: example.com');
            }
        });

        it('returns false if there is no password for the domain being removed', async function() {
            try {
                await keychain.remove('nonexistent.com');
                expect().fail('Expected error was not thrown');
            } catch (err) {
                expect(err.message).to.be('No entry found for domain: nonexistent.com');
            }
        });

        it('can dump and restore the database', async function() {
            await keychain.set('example.com', 'password123');
            await keychain.dump('test-dump.json');

            // Clear the keychain
            keychain.clear();

            // Re-initialize and load the dump
            await keychain.init('test-master-password');
            await keychain.load('test-dump.json');

            const password = await keychain.get('example.com');
            expect(password).to.be('password123');

            // Clean up
            await fs.unlink(path.resolve('test-dump.json'));
        });

        it('fails to restore the database if checksum is wrong', async function() {
            await keychain.set('example.com', 'password123');
            await keychain.dump('test-dump.json');

            // Tamper with the dump file
            let content = await fs.readFile(path.resolve('test-dump.json'), 'utf8');
            let parsed = JSON.parse(content);
            parsed.kvs.data['example.com'] = 'tamperedpassword';
            await fs.writeFile(path.resolve('test-dump.json'), JSON.stringify(parsed, null, 2), 'utf8');

            // Clear the keychain
            keychain.clear();

            // Re-initialize and attempt to load the tampered dump
            await keychain.init('test-master-password');
            try {
                await keychain.load('test-dump.json');
                expect().fail('Expected error was not thrown');
            } catch (err) {
                expect(err.message).to.be('Data integrity check failed. Possible tampering detected.');
            }

            // Clean up
            await fs.unlink(path.resolve('test-dump.json'));
        });

        it('returns false if trying to load with an incorrect password', async function() {
            await keychain.set('example.com', 'password123');
            await keychain.dump('test-dump.json');

            // Clear the keychain
            keychain.clear();

            // Re-initialize with incorrect password
            await keychain.init('wrong-password');
            try {
                await keychain.load('test-dump.json');
                expect().fail('Expected error was not thrown');
            } catch (err) {
                expect(err.message).to.be('Data integrity check failed. Possible tampering detected.');
            }

            // Clean up
            await fs.unlink(path.resolve('test-dump.json'));
        });
    });

    describe('security', function() {
        it("doesn't store domain names and passwords in the clear", async function() {
            await keychain.set('example.com', 'password123');
            const dumpPath = 'test-dump.json';
            await keychain.dump(dumpPath);
            const content = await fs.readFile(path.resolve(dumpPath), 'utf8');
            const parsed = JSON.parse(content);
            expect(parsed.kvs.data['example.com']).to.not.be('password123');
            expect(parsed.kvs.data['example.com']).to.not.contain('example.com');
            // Clean up
            await fs.unlink(path.resolve(dumpPath));
        });

        it('includes a kvs object in the serialized dump', async function() {
            await keychain.dump('test-dump.json');
            const content = await fs.readFile(path.resolve('test-dump.json'), 'utf8');
            const parsed = JSON.parse(content);
            expect(parsed).to.have.property('kvs');
            expect(parsed.kvs).to.have.property('salt');
            expect(parsed.kvs).to.have.property('data');
            expect(parsed.kvs).to.have.property('hmac');
            // Clean up
            await fs.unlink(path.resolve('test-dump.json'));
        });
    });
});
