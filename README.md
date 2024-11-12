

# Password Manager

This Password Manager is a secure and encrypted system for storing and managing passwords for different websites or applications. Built using Node.js and crypto APIs, it leverages AES-GCM encryption and HMAC for data integrity. This project ensures that sensitive data remains secure while being easily accessible when needed.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Operations](#basic-operations)
- [Security](#security)
- [Testing](#testing)
- [Security Discussion Questions](#security-discussion-questions)
- [License](#license)

## Features

- **Encryption**: Uses AES-GCM to encrypt passwords, ensuring data confidentiality.
- **Data Integrity**: HMAC is used to verify data integrity, detecting tampering or corruption.
- **CRUD Operations**: Supports setting, retrieving, updating, and deleting passwords for different domains.
- **Data Persistence**: Dumps and loads encrypted password data to/from a file.
- **Password-Protected Access**: Uses a master password to initialize the keychain.

## Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/jeremywanjohi/passmanager.git
    cd passmanager
    ```

2. **Install Dependencies**: Make sure Node.js is installed. Then, run:
    ```bash
    npm install
    ```

3. **Set Up Environment Variables** (optional): If your code relies on environment variables, set them in a `.env` file.

## Usage

### Initializing the Keychain

To initialize the password manager with a master password:
```javascript
const Keychain = require('./password-manager');

async function main() {
    const keychain = new Keychain();
    await keychain.init('your-master-password');
}

main();

```

### Basic Operations

1\. **Set a Password**:

    ```javascript

    await keychain.set('example.com', 'password123');

    ```

2\. **Get a Password**:

    ```javascript

    const password = await keychain.get('example.com');

    console.log(password); // Outputs: password123

    ```

3\. **Remove a Password**:

    ```javascript

    await keychain.remove('example.com');

    ```

4\. **Dump Keychain Data to a File**:

    ```javascript

    await keychain.dump('passwords.json');

    ```

5\. **Load Keychain Data from a File**:

    ```javascript

    await keychain.load('passwords.json');

    ```

## Security

This project is built with security as a primary focus:

- **Encryption**: All passwords are encrypted with AES-GCM, a modern and secure encryption algorithm.

- **Integrity**: An HMAC is used to verify that the data has not been tampered with.

- **Salted Key Derivation**: PBKDF2 with a random salt is used to derive keys from the master password, adding resistance against brute-force attacks.

## Testing

Unit tests are provided in the `test/test-password-manager.js` file. To run the tests:

1\. **Install Testing Libraries**:

    ```bash

    npm install expect.js

    ```

2\. **Run Tests**:

    ```bash

    npm test

    ```

The tests check various functionalities, including:

- Initialization and HMAC verification

- CRUD operations for passwords

- Data dumping and loading

- Integrity checks to detect tampering


## Security Discussion Questions

1\. **Preventing Adversary Access to Password Lengths**:  

   To prevent adversaries from learning password lengths, we apply fixed-length encryption padding. This approach ensures that all encrypted data appears to have uniform length, making it difficult to infer the actual lengths of stored passwords based on ciphertext size variations.

2\. **Preventing Swap Attacks**:  

   To prevent swap attacks, our scheme utilizes HMAC to verify the integrity of each password entry. Each entry includes an HMAC generated from the data and domain. Since HMACs are deterministic, any attempt to swap data entries would result in HMAC mismatches during verification, thus detecting tampering and preventing successful swap attacks.

3\. **Defending Against Rollback Attacks**:  

   Yes, a trusted location is necessary for the defense against rollback attacks. The SHA-256 hash, representing the current state of the password data, must be stored securely to prevent an attacker from modifying or rolling it back alongside the encrypted data. Without a trusted location, an attacker could replace the current hash with an older one, making the rollback attack undetectable.

4\. **Using a Randomized MAC Instead of HMAC**:  

   Using a randomized MAC would complicate lookups since the MAC output varies with each execution, preventing direct lookups based on MAC values. To handle this, we would need to maintain separate lookup tables or indices that map domain names to their corresponding randomized MACs. This introduces a performance penalty due to increased storage requirements and the additional computational overhead of managing and querying these indices.

5\. **Reducing Information Leakage About Record Counts**:  

   To minimize information leakage about the number of records, we can use padding and dummy entries to obscure the actual record count. By grouping records into fixed-size batches and adding dummy entries as needed, the system ensures that the number of visible records only reflects the logarithm of the true count (log2(k)). Additionally, data obfuscation techniques can serialize a constant number of batches, maintaining uniformity regardless of the actual record count.

6\. **Implementing Multi-User Support**:  

   To enable multi-user support, we can implement namespace separation and role-based access controls. Each user, such as Alice and Bob, has a unique master key derived from their individual master passwords, ensuring that their private data remains isolated. For shared passwords, such as for nytimes, we assign them to a common namespace accessible only to authorized users. This setup allows Alice and Bob to access and update shared entries without granting them access to each other's private passwords for other websites, thus maintaining security and privacy across individual and shared data.


