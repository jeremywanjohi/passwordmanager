# Password Manager

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Initialization](#initialization)
  - [Loading a Keychain](#loading-a-keychain)
  - [Dumping a Keychain](#dumping-a-keychain)
  - [Setting a Password](#setting-a-password)
  - [Getting a Password](#getting-a-password)
  - [Removing a Password](#removing-a-password)
- [Security Considerations](#security-considerations)
  - [Encryption and Integrity](#encryption-and-integrity)
  - [Defenses Against Swap and Rollback Attacks](#defenses-against-swap-and-rollback-attacks)
  - [Prevention of Data Leakage](#prevention-of-data-leakage)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Short-Answer Questions](#short-answer-questions)

## Introduction

Managing multiple strong passwords for various services can be challenging. This Password Manager project offers a secure and efficient way to store and manage your passwords using robust cryptographic techniques.

**Note:** This implementation is for educational purposes and should not be used as a substitute for professional password managers.

## Features

- **Secure Storage:** Encrypts passwords using AES-GCM for confidentiality and integrity.
- **Data Serialization:** Easily save and load password data through JSON serialization and deserialization.
- **Security Defenses:**
  - **Swap Attack Protection:** Prevents adversaries from swapping domain-password pairs.
  - **Rollback Attack Protection:** Ensures integrity of the password database using SHA-256 checksums.
- **Data Leakage Prevention:** Masks domain names with HMACs, pads passwords to a fixed length, and obscures the number of records.
- **Efficient Key Derivation:** Uses PBKDF2 to derive cryptographic keys from a master password, limiting calls to one during initialization.
- **Comprehensive Testing:** Includes a suite of unit and integration tests.
- **Clear Documentation:** Provides guides for usage and maintenance.
- **Modular Code Structure:** Organized into well-defined modules for easy collaboration.

## Installation

### Prerequisites

- **Node.js:** Ensure you have Node.js installed. Download it from [https://nodejs.org/en/download/](https://nodejs.org/en/download/).

### Steps

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/your-repo/password-manager.git
    cd password-manager
    ```

2. **Install Dependencies:**
    ```bash
    npm install
    ```

3. **Run Tests (Optional):**
    ```bash
    npm test
    ```

## Usage

The Password Manager provides a core library with methods to initialize, load, dump, set, get, and remove password entries. Below is a guide on how to utilize these functionalities.

### Importing the Password Manager

```javascript
const Keychain = require('./password-manager.js');



Thought for 9 seconds

markdown
Copy code
# Password Manager Keychain

A secure and efficient password manager keychain implemented in JavaScript. This keychain allows you to initialize, load, dump, set, get, and remove passwords securely using industry-standard encryption and hashing techniques.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Initializing a New Keychain](#initializing-a-new-keychain)
  - [Loading an Existing Keychain](#loading-an-existing-keychain)
  - [Dumping the Keychain](#dumping-the-keychain)
  - [Setting a Password](#setting-a-password)
  - [Getting a Password](#getting-a-password)
  - [Removing a Password](#removing-a-password)
- [API Reference](#api-reference)
  - [Initialization](#initialization)
  - [Loading a Keychain](#loading-a-keychain)
  - [Dumping the Keychain](#dumping-the-keychain)
  - [Setting a Password](#setting-a-password)
  - [Getting a Password](#getting-a-password)
  - [Removing a Password](#removing-a-password)
- [Security Considerations](#security-considerations)
  - [Encryption and Integrity](#encryption-and-integrity)
  - [Defenses Against Swap and Rollback Attacks](#defenses-against-swap-and-rollback-attacks)
  - [Prevention of Data Leakage](#prevention-of-data-leakage)
- [Testing](#testing)
  - [Testing Framework](#testing-framework)
  - [Running Tests](#running-tests)
  - [Test Structure](#test-structure)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)
- [Versioning](#versioning)
- [Additional Resources](#additional-resources)
- [FAQs](#faqs)
- [Changelog](#changelog)
- [Support](#support)
- [Disclaimer](#disclaimer)
- [Final Notes](#final-notes)
- [Short Example](#short-example)
- [Code of Conduct](#code-of-conduct)
- [Repository Links](#repository-links)
- [Credits](#credits)

## Features

- **Secure Storage:** Encrypts passwords using AES-GCM and masks domain names with HMAC-SHA-256.
- **Integrity Verification:** Utilizes SHA-256 checksums to ensure data integrity.
- **Easy to Use:** Simple API for managing your passwords.
- **Cross-Platform:** Designed to work in both Node.js and browser environments.
- **Comprehensive Testing:** Includes unit and integration tests to ensure reliability.

## Installation

To install the password manager keychain, use npm:

```markdown

## Usage

### Initializing a New Keychain

```javascript

(async () => {

    const masterPassword = 'your-secure-master-password';

    const keychain = await Keychain.init(masterPassword);

})();

```

### Loading an Existing Keychain

```javascript

(async () => {

    const masterPassword = 'your-secure-master-password';

    const serializedData = '...'; // JSON string from dump()

    const trustedHash = '...'; // SHA-256 hash from dump()

    const keychain = await Keychain.load(masterPassword, serializedData, trustedHash);

})();

```

### Dumping the Keychain

```javascript

(async () => {

    const keychain = await Keychain.init('masterPassword');

    // ... perform operations like set, get, etc.

    const [serializedData, checksum] = await keychain.dump();

    // Save serializedData and checksum securely

})();

```

### Setting a Password

```javascript

(async () => {

    const keychain = await Keychain.init('masterPassword');

    await keychain.set('example.com', 'securePassword123');

})();

```

### Getting a Password

```javascript

(async () => {

    const keychain = await Keychain.init('masterPassword');

    const password = await keychain.get('example.com');

    console.log(password); // Outputs: securePassword123

})();

```

### Removing a Password

```javascript

(async () => {

    const keychain = await Keychain.init('masterPassword');

    const success = await keychain.remove('example.com');

    console.log(success ? 'Password removed.' : 'Domain not found.');

})();

```

## API Reference

### Initialization

#### `static async init(password)`

**Parameters:**

- `password` (`string`): The master password to protect the keychain.

**Returns:**

- `Keychain` object.

**Run-time:** O(1)

**Description:**  

Creates a new key-value store (KVS) and derives cryptographic keys using PBKDF2 with a single call. The derived keys are cached for future operations.

**Example:**

```javascript

const keychain = await Keychain.init('masterPassword');

```

### Loading a Keychain

#### `static async load(password, representation, trustedDataCheck)`

**Parameters:**

- `password` (`string`): The master password.

- `representation` (`string`): JSON-encoded serialization of the keychain.

- `trustedDataCheck` (`string`, optional): SHA-256 hash to verify integrity.

**Returns:**

- `Keychain` object.

**Run-time:** O(n)

**Description:**  

Loads the keychain state from a serialized representation, verifying the master password and, if provided, the integrity of the data using the SHA-256 checksum.

**Example:**

```javascript

const keychain = await Keychain.load('masterPassword', serializedData, checksum);

```

### Dumping the Keychain

#### `async dump()`

**Returns:**

- `Array` of two strings: `[JSON-encoded keychain, SHA-256 checksum]`.

**Run-time:** O(n)

**Description:**  

Serializes the keychain into a JSON string and computes its SHA-256 checksum for integrity verification.

**Example:**

```javascript

const [serializedData, checksum] = await keychain.dump();

```

### Setting a Password

#### `async set(name, value)`

**Parameters:**

- `name` (`string`): Domain name.

- `value` (`string`): Password to store.

**Returns:**

- `void`

**Run-time:** O(1)

**Description:**  

Encrypts and stores the password for the specified domain. If the domain already exists, its password is updated.

**Example:**

```javascript

await keychain.set('example.com', 'securePassword123');

```

### Getting a Password

#### `async get(name)`

**Parameters:**

- `name` (`string`): Domain name.

**Returns:**

- `string | null`: The password associated with the domain or `null` if not found.

**Run-time:** O(1)

**Description:**  

Decrypts and retrieves the password for the specified domain. Returns `null` if the domain does not exist.

**Example:**

```javascript

const password = await keychain.get('example.com');

console.log(password); // Outputs: securePassword123

```

### Removing a Password

#### `async remove(name)`

**Parameters:**

- `name` (`string`): Domain name.

**Returns:**

- `boolean`: `true` if the record was found and removed, `false` otherwise.

**Run-time:** O(1)

**Description:**  

Removes the password entry for the specified domain from the keychain.

**Example:**

```javascript

const success = await keychain.remove('example.com');

console.log(success ? 'Password removed.' : 'Domain not found.');

```

## Security Considerations

### Encryption and Integrity

- **AES-GCM:** Ensures confidentiality and integrity of passwords.

- **HMAC-SHA-256:** Masks domain names and verifies data integrity.

- **PBKDF2:** Derives secure keys from the master password with a single call.

### Defenses Against Swap and Rollback Attacks

- **Swap Attack Protection:**

  - **Method:** Domain names are stored as HMACs using a secret HMAC key.

  - **Rationale:** Prevents adversaries from swapping domain-password pairs without access to the secret key.

- **Rollback Attack Protection:**

  - **Method:** A SHA-256 checksum of the keychain is computed and stored in a trusted location.

  - **Rationale:** Ensures the keychain has not been tampered with by verifying the checksum upon loading.

### Prevention of Data Leakage

- **Domain Names:** Stored as HMACs to obscure actual domain names.

- **Password Lengths:** Padded to a fixed length (e.g., 64 characters) to prevent leakage of their actual lengths.

- **Record Counts:** Measures are implemented to obscure the number of stored records, preventing adversaries from deducing the size of the keychain.

## Testing

### Testing Framework

- **MochaJS:** For structuring and running tests.

- **Expect.js:** For assertions.

### Running Tests

Execute the test suite with:

```bash

npm test

```

### Test Structure

- **Unit Tests:** Located in the `test/` directory, covering individual modules.

- **Integration Tests:** Ensure modules work together and maintain security.

## Project Structure

```plaintext

password-manager/

├── src/

│   ├── init.js                # Initialization & Key Management

│   ├── set.js                 # Encryption & Decryption - Set Entry

│   ├── get.js                 # Encryption & Decryption - Get Entry

│   ├── remove.js              # Encryption & Decryption - Remove Entry

│   ├── dump.js                # Serialization - Dump Keychain

│   ├── load.js                # Serialization - Load Keychain

│   ├── utils/

│   │   ├── encryption.js      # Encryption Utilities

│   │   ├── checksum.js        # Checksum Utilities

│   │   ├── hashing.js         # HMAC Hashing Functions

│   │   └── security.js        # Additional Security Functions

├── test/

│   ├── init.test.js           # Tests for Initialization

│   ├── set.test.js            # Tests for Setting Passwords

│   ├── get.test.js            # Tests for Getting Passwords

│   ├── remove.test.js         # Tests for Removing Passwords

│   ├── dump.test.js           # Tests for Dumping Keychain

│   ├── load.test.js           # Tests for Loading Keychain

│   ├── hashing.test.js        # Tests for HMAC Hashing

│   ├── security.test.js       # Tests for Security Defenses

│   └── test-password-manager.js # Comprehensive Integration Tests

├── lib.js                     # Helper Functions for Data Conversion

├── password-manager.js        # Core API Layer Exposing Keychain Class

├── README.md                  # Documentation

├── SECURITY.md                # Security Guidelines

├── package.json               # Project Dependencies and Scripts

└── eslint.config.mjs          # Linter Configuration

```

## Contributing

Contributions are welcome! Please follow these steps:

### Fork the Repository

### Create a Feature Branch

```bash

git checkout -b feature/your-feature

```

### Commit Your Changes

```bash

git commit -m "Add your message here"

```

### Push to the Branch

```bash

git push origin feature/your-feature

```

### Submit a Pull Request

Feel free to open issues or submit pull requests for any enhancements or bug fixes!

---

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or support, please contact [your-email@example.com](mailto:your-email@example.com).

## Acknowledgements

Thank you to all contributors and the open-source community for their support and feedback.

## Versioning

We use [SemVer](https://semver.org/) for versioning. For the available versions, see the [tags on this repository](https://github.com/your-repo/tags).

## Additional Resources

- [MochaJS Documentation](https://mochajs.org/)

- [Expect.js Documentation](https://github.com/Automattic/expect.js)

- [PBKDF2 Overview](https://en.wikipedia.org/wiki/PBKDF2)

- [AES-GCM Specification](https://en.wikipedia.org/wiki/Galois/Counter_Mode)

## FAQs

**Q:** How secure is the keychain?  

**A:** The keychain employs industry-standard encryption algorithms and best practices to ensure the highest level of security for your passwords.

**Q:** Can I use this keychain in a browser environment?  

**A:** Yes, the keychain is designed to work in both Node.js and browser environments.

**Q:** How do I reset my keychain?  

**A:** To reset your keychain, delete the serialized data and checksum, then initialize a new keychain using `Keychain.init()`.

## Changelog

### [1.2.0] - 2024-08-10

**Added**

- Support for fixed-length password padding to prevent data leakage.

- Obfuscation of record counts to enhance security.

### [1.1.0] - 2024-06-15

**Added**

- Enhanced security measures against swap and rollback attacks.

- Additional utility functions for encryption and checksum operations.

**Fixed**

- Minor bugs in the password retrieval process.

### [1.0.0] - 2024-04-27

**Added**

- Initial release with core functionalities: init, load, dump, set, get, remove.

- Security features including AES-GCM encryption and HMAC-SHA-256 hashing.

- Comprehensive testing suite with unit and integration tests.

- Documentation and contributing guidelines.

## Support

If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/your-repo/issues).

## Disclaimer

Use this password manager at your own risk. We are not liable for any data loss or security breaches.

## Final Notes

Ensure that you keep your master password secure and never share it with anyone. Regularly back up your serialized keychain data and checksum in a safe location.

## Short Example

For a quick start, here's a short example of using the keychain:

```javascript

(async () => {

    const masterPassword = 'myStrongPassword!';

    // Initialize a new keychain

    const keychain = await Keychain.init(masterPassword);

    // Set a password

    await keychain.set('example.com', 'password123');

    // Get the password

    const password = await keychain.get('example.com');

    console.log(`Password for example.com: ${password}`);

    // Dump the keychain

    const [serializedData, checksum] = await keychain.dump();

    // Later, load the keychain

    const loadedKeychain = await Keychain.load(masterPassword, serializedData, checksum);

})();

```

## Code of Conduct

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) when contributing to this project.

## Repository Links

- [GitHub Repository](https://github.com/your-repo)

- [NPM Package](https://www.npmjs.com/package/your-package)

## Credits

Developed by [Your Name](https://your-website.com).

---

```