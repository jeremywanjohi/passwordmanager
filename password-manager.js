// password-manager.js

/**
 * PasswordManager class for managing encrypted passwords.
 * Utilizes the Web Crypto API and localStorage for encryption and storage.
 */
export default class PasswordManager {
    constructor() {
        // Load data from localStorage or initialize a new structure
        this.kvs = JSON.parse(localStorage.getItem('passwordManagerData')) || {
            salt: null,
            data: {},
            hmac: ''
        };
        this.masterKey = null; // CryptoKey derived from master password
        this.hmacKey = null;   // CryptoKey for HMAC integrity
        this.masterPassword = null; // Stored for key re-derivation
    }

    /**
     * Initializes the PasswordManager with the master password.
     * Derives a master key and an HMAC key using PBKDF2.
     * @param {string} masterPassword 
     */
    async init(masterPassword) {
        if (this.masterKey || this.hmacKey) {
            throw new Error("PasswordManager is already initialized.");
        }

        this.masterPassword = masterPassword;

        // Generate a random salt if not already present
        let salt;
        if (this.kvs.salt) {
            salt = this.hexToBuffer(this.kvs.salt);
        } else {
            salt = crypto.getRandomValues(new Uint8Array(16));
            this.kvs.salt = this.bufferToHex(salt);
            await this.updateLocalStorage();
        }

        // Encode the master password
        const passwordBuffer = new TextEncoder().encode(masterPassword);

        // Derive a master key using PBKDF2
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        // Derive master encryption key
        this.masterKey = await crypto.subtle.deriveKey(
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
        this.hmacKey = await crypto.subtle.deriveKey(
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

        // If HMAC exists, verify integrity
        if (this.kvs.hmac) {
            await this.verifyIntegrity();
        } else {
            // Compute initial HMAC
            await this.updateHmac();
        }
    }

    /**
     * Updates the HMAC of the current kvs.data and stores it in kvs.hmac.
     */
    async updateHmac() {
        if (!this.hmacKey) {
            throw new Error("PasswordManager is not initialized.");
        }
        const dataString = JSON.stringify(this.kvs.data);
        const dataBuffer = new TextEncoder().encode(dataString);
        const signature = await crypto.subtle.sign(
            'HMAC',
            this.hmacKey,
            dataBuffer
        );
        this.kvs.hmac = this.bufferToHex(new Uint8Array(signature));
        await this.updateLocalStorage();
    }

    /**
     * Verifies the integrity of the kvs.data using HMAC.
     * Throws an exception if tampering is detected.
     */
    async verifyIntegrity() {
        if (!this.hmacKey) {
            throw new Error("PasswordManager is not initialized.");
        }
        const dataString = JSON.stringify(this.kvs.data);
        const dataBuffer = new TextEncoder().encode(dataString);
        const signature = this.hexToBuffer(this.kvs.hmac);

        const isValid = await crypto.subtle.verify(
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
            throw new Error("PasswordManager is not initialized. Call init(masterPassword) first.");
        }
        const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
        const plaintextBuffer = new TextEncoder().encode(plaintext);

        const ciphertextBuffer = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            this.masterKey,
            plaintextBuffer
        );

        return `${this.bufferToHex(iv)}:${this.bufferToHex(new Uint8Array(ciphertextBuffer))}`;
    }

    /**
     * Decrypts ciphertext using AES-GCM.
     * @param {string} encryptedData - IV and ciphertext concatenated in hex, separated by ':'
     * @returns {Promise<string>} - Decrypted plaintext
     */
    async decrypt(encryptedData) {
        if (!this.masterKey) {
            throw new Error("PasswordManager is not initialized. Call init(masterPassword) first.");
        }
        const [ivHex, ciphertextHex] = encryptedData.split(':');
        const iv = this.hexToBuffer(ivHex);
        const ciphertext = this.hexToBuffer(ciphertextHex);

        let plaintextBuffer;
        try {
            plaintextBuffer = await crypto.subtle.decrypt(
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

        return new TextDecoder().decode(plaintextBuffer);
    }

    /**
     * Sets a password for a given domain.
     * @param {string} domain 
     * @param {string} password 
     */
    async addPassword(domain, password) {
        if (!this.masterKey) {
            throw new Error("PasswordManager is not initialized. Call init(masterPassword) first.");
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
    async getPassword(domain) {
        if (!this.masterKey) {
            throw new Error("PasswordManager is not initialized. Call init(masterPassword) first.");
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
    async removePassword(domain) {
        if (!this.masterKey) {
            throw new Error("PasswordManager is not initialized. Call init(masterPassword) first.");
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
     * Exports the password manager data as a JSON file.
     */
    exportData() {
        const dataStr = JSON.stringify(this.kvs, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'password-manager-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Imports password manager data from a JSON file.
     * @param {File} file 
     */
    async importData(file) {
        const reader = new FileReader();

        const loadPromise = new Promise((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const importedData = JSON.parse(reader.result);
                    // Basic validation
                    if (!importedData.salt || !importedData.data || !importedData.hmac) {
                        throw new Error("Invalid data format.");
                    }
                    this.kvs = importedData;
                    await this.updateLocalStorage();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read the file."));
            };
        });

        reader.readAsText(file);
        return loadPromise;
    }

    /**
     * Clears all data from the password manager.
     */
    clearAllData() {
        this.kvs = {
            salt: null,
            data: {},
            hmac: ''
        };
        this.masterKey = null;
        this.hmacKey = null;
        this.masterPassword = null;
        localStorage.removeItem('passwordManagerData');
    }

    /**
     * Saves the current kvs object to localStorage.
     */
    async updateLocalStorage() {
        localStorage.setItem('passwordManagerData', JSON.stringify(this.kvs));
    }

    /**
     * Converts a Buffer to a hexadecimal string.
     * @param {Uint8Array} buffer 
     * @returns {string}
     */
    bufferToHex(buffer) {
        return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Converts a hexadecimal string to a Buffer.
     * @param {string} hex 
     * @returns {ArrayBuffer}
     */
    hexToBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes.buffer;
    }

    /**
     * Checks if the Password Manager is initialized.
     * @returns {boolean}
     */
    isInitialized() {
        return this.masterKey !== null && this.hmacKey !== null;
    }
}
