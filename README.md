# Password Manager

This Password Manager is a secure and encrypted system for storing and managing passwords for different websites or applications. Built using Node.js and crypto APIs, it leverages AES-GCM encryption and HMAC for data integrity. This project ensures that sensitive data remains secure while being easily accessible when needed.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Operations](#basic-operations)
- [Security](#security)
- [Testing](#testing)
- [Project Structure](#project-structure)
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


### Basic Operations

1.  **Set a Password**:

    javascript

    Copy code

    `await keychain.set('example.com', 'password123');`

2.  **Get a Password**:

    javascript

    Copy code

    `const password = await keychain.get('example.com');
    console.log(password); // Outputs: password123`

3.  **Remove a Password**:

    javascript

    Copy code

    `await keychain.remove('example.com');`

4.  **Dump Keychain Data to a File**:

    javascript

    Copy code

    `await keychain.dump('passwords.json');`

5.  **Load Keychain Data from a File**:

    javascript

    Copy code

    `await keychain.load('passwords.json');`

### Example

javascript

Copy code

`const Keychain = require('./password-manager');

async function main() {
    const keychain = new Keychain();
    await keychain.init('your-master-password');

    await keychain.set('example.com', 'password123');
    console.log(await keychain.get('example.com')); // Outputs: password123

    await keychain.dump('passwords.json');
    keychain.clear(); // Clear memory

    await keychain.init('your-master-password');
    await keychain.load('passwords.json');
    console.log(await keychain.get('example.com')); // Outputs: password123
}

main();`

Security
--------

This project is built with security as a primary focus:

-   **Encryption**: All passwords are encrypted with AES-GCM, a modern and secure encryption algorithm.
-   **Integrity**: An HMAC is used to verify that the data has not been tampered with.
-   **Salted Key Derivation**: PBKDF2 with a random salt is used to derive keys from the master password, adding resistance against brute-force attacks.

Testing
-------

Unit tests are provided in the `test/test-password-manager.js` file. To run the tests:

1.  **Install Testing Libraries**:

    bash

    Copy code

    `npm install expect.js`

2.  **Run Tests**:

    bash

    Copy code

    `npm test`

The tests check various functionalities, including:

-   Initialization and HMAC verification
-   CRUD operations for passwords
-   Data dumping and loading
-   Integrity checks to detect tampering

Project Structure
-----------------

bash

Copy code

`PasswordManager/
├── password-manager.js        # Main Keychain class
├── test/
│   └── test-password-manager.js # Unit tests
├── README.md                  # Project documentation
└── package.json               # Dependencies and scripts`
