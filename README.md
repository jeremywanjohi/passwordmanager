

# Password Manager

This Password Manager is a secure and encrypted system for storing and managing passwords for different websites or applications. Built using Node.js and crypto APIs, it leverages AES-GCM encryption and HMAC for data integrity. This project ensures that sensitive data remains secure while being easily accessible when required.

# Members

| Member | ID     | Name                          |
|--------|--------|-------------------------------|
| 1      | 150892 | Islam Faruk Jeizan            |
| 2      | 151947 | Chikuro Emmanuel        |
| 3      | 151673 | Simiyu Michael Keith Wanjala  |
| 4      | 150000 | Wanjohi Jeremy Kariuki        |


## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Operations](#basic-operations)
  - [Using the CLI](#using-the-cli)
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
    git clone https://github.com/jeremywanjohi/passwordmanager.git
    cd passwordmanager
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

## Basic Operations

- **Set a Password**:
    ```javascript
    await keychain.set('example.com', 'password123');
    ```

- **Get a Password**:
    ```javascript
    const password = await keychain.get('example.com');
    console.log(password); // Outputs: password123
    ```

- **Remove a Password**:
    ```javascript
    await keychain.remove('example.com');
    ```

- **Dump Keychain Data to a File**:
    ```javascript
    await keychain.dump('passwords.json');
    ```

- **Load Keychain Data from a File**:
    ```javascript
    await keychain.load('passwords.json');
    ```



### Using the CLI

The Password Manager CLI provides an interactive way to manage your passwords securely.

#### Launching the CLI

To start the CLI, navigate to your project directory in the terminal and run:

- **Directly with Node.js**
  ```bash
  node cli.js `


#### Initial Setup

1\. **Create a Master Password:**

   If it's your first time running the CLI, you'll be prompted to create a master password.

   - **Requirements:**

     - Minimum of 6 characters.

     - Should be strong and unique for maximum security.

 

2\. **Load Existing Keychain:**

   If a keychain already exists, you'll be prompted to enter your master password to access your stored passwords.


#### Main Menu

After initialization, you'll see a menu with the following options:

```plaintext 

? Select an action:

❯ Add a password

  Retrieve a password

  Remove a password

  List all websites

  ────────────

  Exit

```

Use the arrow keys to navigate and press `Enter` to select an option.

#### Basic Operations

1\. **Add a Password**

   - **Purpose:** Store a new password for a specific website or application.

   - **Steps:**

     1. Select **"Add a password"** from the main menu.

     2. Enter the website URL or name.

     3. Enter the password.


2\. **Retrieve a Password**

   - **Purpose:** Fetch the password for a specific website.

   - **Steps:**

     1. Select **"Retrieve a password"** from the main menu.

     2. Enter the website URL or name.


3\. **Remove a Password**

   - **Purpose:** Delete the password entry for a specific website.

   - **Steps:**

     1. Select **"Remove a password"** from the main menu.

     2. Enter the website URL or name.


4\. **List All Websites**

   - **Purpose:** Display all websites for which passwords are stored.

   - **Steps:**

     1. Select **"List all websites"** from the main menu.


5\. **Exit**

   - **Purpose:** Safely exit the application.

   - **Steps:**

     1. Select **"Exit"** from the main menu.


## Security

This project is built with security as a primary focus:

- **Encryption**: All passwords are encrypted with AES-GCM, a modern and secure encryption algorithm.
- **Integrity**: An HMAC is used to verify that the data has not been tampered with.
- **Salted Key Derivation**: PBKDF2 with a random salt is used to derive keys from the master password, adding resistance against brute-force attacks.

## Testing

Unit tests are provided in the `test/test-password-manager.js` file. To run the tests:

1. **Install Testing Libraries**:
    ```bash
    npm install expect.js
    ```

2. **Run Tests**:
    ```bash
    npm test
    ```

The tests check various functionalities, including:

- Initialization and HMAC verification
- CRUD operations for passwords
- Data dumping and loading
- Integrity checks to detect tampering

## Security Discussion Questions

1. **Preventing Adversary Access to Password Lengths**:  
   To maintain the confidentiality of password information from the adversaries, we implement fixed length padding options to transform the passwords to a set maximum length (e.g., 64 characters). This padding makes the fact that every password has the same size after they have been encrypted a reality. Also, all padded passwords are encrypted to produce other alphanumeric characters that are of equal length as those generated from the original passwords. In this way, the adversaries cannot deduce the real length of any stored password with the look-up of the ciphertext as each entry has the same encrypted size.


2. **Preventing Swap Attacks**:  
  In order to counter swap attacks, the current scheme uses HMAC which allows secure storage of domain names. Any given domain name is hashed using HMAC-SHA-256 protocol employing a secret key so the resulting hash are unique and secure. That is why HMAC-SHA-256 is secure; thus, the adversaries cannot generate valid HMACs without having the secret key; this means they cannot afford to counterfeit domain-password pairs. At the verification stage, each stored HMAC is validated with the key, which will check each domain with its password combination. This approach is successful in preventing swap attacks because an adversary cannot create new, valid HMACS points to different domain names.


3. **Defending Against Rollback Attacks**:  
  In a password manager, a rollback attack might allow an attacker to restore older, potentially compromised versions of encrypted data, circumventing any updates or security enhancements. The SHA-256 hash represents the current state of critical information, such as the version or integrity of encrypted data. The system can detect whether data has been rolled back by comparing this hash with the expected value stored in a trusted location. If the current hash doesn’t match the trusted value, it indicates tampering or a rollback attempt.
Yes, a trusted location is necessary for the defence against rollback attacks because if an attacker can modify or rollback this hash along with the encrypted data (i.e., the hash is not stored in a trusted location), they can effectively bypass the rollback defence. The attacker could replace the current hash with a previous one, making the rollback undetectable.

4. **Using a Randomized MAC Instead of HMAC**:  
   The use of a randomized MAC would make it difficult to perform lookups since the MAC output is different with each execution, preventing direct lookups based on MAC values. As a solution to that, we would need to maintain separate lookup tables or indices that map domain names to their corresponding randomized MACs. This leads to a performance penalty due to increased storage requirements and the additional computational overhead of managing and querying these indices.

5. **Reducing Information Leakage About Record Counts**:  
  To minimise the risk of revealing the actual number of records in the password manager, we can use padding and dummy entries to hide the actual record count. Moreover, we need to ensure that the system only reveals information proportional to the logarithm of the number of records log(k). This is implemented using batch grouping, which involves organising records into groups of fixed size, each batch having a combination of real and dummy entries .In addition, data obfuscation, which serialises a constant number of batches, maintains uniformity regardless of the actual record count and lastly, as records grow, we add new groups logarithmically to maintain consistent appearance and minimal data leakage.

6. **Implementing Multi-User Support**:
   To enable multi-user support for specific sites for individual users, we can implement role-based access controls and namespace separation, allowing only designated users to access shared passwords. This implementation will entail authentication—assigning each user a unique master password to derive individual cryptographic keys. For namespace separation, we assign unique namespaces for each user to isolate their private data, which as a result prevents unauthorised access. In addition for shared entries, we can use common namespaces only accessible to authorised users and apply role-based access, allowing certain users access to shared entries. All in all, the aim is to ensure key management separates user’s private data with shared data only accessible by designated users.

  
