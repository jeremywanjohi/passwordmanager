// password-manager.js

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Utility function to generate random bytes.
 * @param {number} length - Number of bytes to generate.
 * @returns {Promise<Buffer>}
 */
async function getRandomBytes(length) {
    return crypto.randomBytes(length);
}

/**
 * Keychain class for managing encrypted passwords.
 */
class Keychain {
    constructor() {
        // Internal key-value store
        this.kvs = {};
        this.masterKey = null; // CryptoKey derived from master password
        this.hmacKey = null;   // CryptoKey for HMAC integrity
        this.masterPassword = null; // Stored for key re-derivation
    }

    /**
     * Initializes the Keychain with the master password.
     * Derives a master key and an HMAC key using PBKDF2.
     * Ensures that PBKDF2 is called only once.
     * @param {string} masterPassword 
     */
    async init(masterPassword) {
        if (this.masterKey || this.hmacKey) {
            throw new Error("Keychain is already initialized.");
        }

        this.masterPassword = masterPassword;

        // Generate a random salt
        const salt = await getRandomBytes(16);

        // Encode the master password
        const enc = new TextEncoder();
        const passwordBuffer = enc.encode(masterPassword);

        // Derive a master key using PBKDF2
        const keyMaterial = await crypto.webcrypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        // Derive master encryption key
        this.masterKey = await crypto.webcrypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        // Derive HMAC key using the same PBKDF2
        this.hmacKey = await crypto.webcrypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'HMAC', hash: 'SHA-256', length: 256 },
            false,
            ['sign', 'verify']
        );

        // Initialize kvs with salt and empty data
        this.kvs = {
            salt: salt.toString('hex'),
            data: {},
            hmac: '' // Will be set after data initialization
        };

        // Compute initial HMAC
        await this.updateHmac();
    }

    /**
     * Updates the HMAC of the current kvs.data and stores it in kvs.hmac.
     */
    async updateHmac() {
        if (!this.hmacKey) {
            throw new Error("Keychain is not initialized.");
        }
        const enc = new TextEncoder();
        const dataString = JSON.stringify(this.kvs.data);
        const dataBuffer = enc.encode(dataString);
        const signature = await crypto.webcrypto.subtle.sign(
            'HMAC',
            this.hmacKey,
            dataBuffer
        );
        this.kvs.hmac = Buffer.from(signature).toString('hex');
    }

    /**
     * Verifies the integrity of the kvs.data using HMAC.
     * Throws an exception if tampering is detected.
     */
    async verifyIntegrity() {
        if (!this.hmacKey) {
            throw new Error("Keychain is not initialized.");
        }
        const enc = new TextEncoder();
        const dataString = JSON.stringify(this.kvs.data);
        const dataBuffer = enc.encode(dataString);
        const signature = Buffer.from(this.kvs.hmac, 'hex');

        const isValid = await crypto.webcrypto.subtle.verify(
            'HMAC',
            this.hmacKey,
            signature,
            dataBuffer
        );

        if (!isValid) {
            throw new Error("Data integrity check failed. Possible tampering detected.");
        }
    }

    /**
     * Encrypts plaintext using AES-GCM.
     * @param {string} plaintext 
     * @returns {Promise<string>} - IV and ciphertext concatenated in hex, separated by ':'
     */
    async encrypt(plaintext) {
        if (!this.masterKey) {
            throw new Error("Keychain is not initialized. Call init(masterPassword) first.");
        }
        const enc = new TextEncoder();
        const iv = await getRandomBytes(12); // 96-bit IV for AES-GCM
        const plaintextBuffer = enc.encode(plaintext);

        const ciphertextBuffer = await crypto.webcrypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            this.masterKey,
            plaintextBuffer
        );

        return Buffer.from(iv).toString('hex') + ':' + Buffer.from(ciphertextBuffer).toString('hex');
    }

    /**
     * Decrypts ciphertext using AES-GCM.
     * @param {string} encryptedData - IV and ciphertext concatenated in hex, separated by ':'
     * @returns {Promise<string>} - Decrypted plaintext
     */
    async decrypt(encryptedData) {
        if (!this.masterKey) {
            throw new Error("Keychain is not initialized. Call init(masterPassword) first.");
        }
        const [ivHex, ciphertextHex] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const ciphertext = Buffer.from(ciphertextHex, 'hex');

        let plaintextBuffer;
        try {
            plaintextBuffer = await crypto.webcrypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.masterKey,
                ciphertext
            );
        } catch (e) {
            throw new Error("Decryption failed. Possible tampering detected.");
        }

        const dec = new TextDecoder();
        return dec.decode(plaintextBuffer);
    }

    /**
     * Sets a password for a given domain.
     * @param {string} domain 
     * @param {string} password 
     */
    async set(domain, password) {
        if (!this.masterKey) {
            throw new Error("Keychain is not initialized. Call init(masterPassword) first.");
        }

        await this.verifyIntegrity();

        const encryptedPassword = await this.encrypt(password);
        this.kvs.data[domain] = encryptedPassword;

        await this.updateHmac();
    }

    /**
     * Retrieves the password for a given domain.
     * @param {string} domain 
     * @returns {Promise<string>} - The decrypted password.
     */
    async get(domain) {
        if (!this.masterKey) {
            throw new Error("Keychain is not initialized. Call init(masterPassword) first.");
        }

        await this.verifyIntegrity();

        const encryptedPassword = this.kvs.data[domain];
        if (!encryptedPassword) {
            throw new Error(`No entry found for domain: ${domain}`);
        }

        return await this.decrypt(encryptedPassword);
    }

    /**
     * Removes the password for a given domain.
     * @param {string} domain 
     */
    async remove(domain) {
        if (!this.masterKey) {
            throw new Error("Keychain is not initialized. Call init(masterPassword) first.");
        }

        await this.verifyIntegrity();

        if (this.kvs.data[domain]) {
            delete this.kvs.data[domain];
            await this.updateHmac();
        } else {
            throw new Error(`No entry found for domain: ${domain}`);
        }
    }

    /**
     * Dumps the keychain to a specified file.
     * Serialization includes the kvs object.
     * @param {string} filepath 
     */
    async dump(filepath) {
        if (!this.masterKey) {
            throw new Error("Keychain is not initialized. Call init(masterPassword) first.");
        }

        const dataToDump = {
            kvs: this.kvs
        };

        const jsonString = JSON.stringify(dataToDump, null, 2);
        await fs.writeFile(path.resolve(filepath), jsonString, 'utf8');
    }

    /**
     * Loads the keychain from a specified file.
     * Deserialization restores the kvs object and verifies integrity.
     * @param {string} filepath 
     */
    async load(filepath) {
        if (!this.masterPassword) {
            throw new Error("Keychain is not initialized. Call init(masterPassword) first.");
        }

        const fileContent = await fs.readFile(path.resolve(filepath), 'utf8');
        let parsed;
        try {
            parsed = JSON.parse(fileContent);
        } catch (e) {
            throw new Error("Invalid JSON format in keychain file.");
        }

        if (!parsed.kvs || typeof parsed.kvs !== 'object') {
            throw new Error("Invalid keychain file format.");
        }

        // Extract the salt
        const saltHex = parsed.kvs.salt;
        if (!saltHex) {
            throw new Error("Keychain file is missing salt.");
        }
        const salt = Buffer.from(saltHex, 'hex');

        // Re-derive the masterKey and hmacKey using stored master password and loaded salt
        const enc = new TextEncoder();
        const passwordBuffer = enc.encode(this.masterPassword);

        const keyMaterial = await crypto.webcrypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        this.masterKey = await crypto.webcrypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        this.hmacKey = await crypto.webcrypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'HMAC', hash: 'SHA-256', length: 256 },
            false,
            ['sign', 'verify']
        );

        // Set the kvs
        this.kvs = parsed.kvs;

        // Verify integrity
        await this.verifyIntegrity();
    }

    /**
     * Clears the in-memory key-value store.
     */
    clear() {
        this.kvs = {};
        this.masterKey = null;
        this.hmacKey = null;
        this.masterPassword = null;
    }
}

export default Keychain;
