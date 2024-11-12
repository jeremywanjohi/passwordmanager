// cli.js

import inquirer from 'inquirer';
import chalk from 'chalk';
import Keychain from './password-manager.js'; // Ensure the '.js' extension is included
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Emulate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keychainFile = path.resolve(__dirname, 'keychain.json');

const keychain = new Keychain();

/**
 * Initializes the keychain by either loading an existing one or creating a new one.
 */
async function initializeKeychain() {
    try {
        await fs.access(keychainFile);
        // Existing keychain found, prompt for master password
        const { masterPassword } = await inquirer.prompt([
            {
                type: 'password',
                name: 'masterPassword',
                message: 'Enter your master password:',
                mask: '*',
                validate: input => input.length > 0 || 'Master password cannot be empty.'
            }
        ]);

        await keychain.init(masterPassword);
        await keychain.load('keychain.json');
        console.log(chalk.green('Keychain loaded successfully.'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            // No keychain found, create a new one
            const { masterPassword, confirmPassword } = await inquirer.prompt([
                {
                    type: 'password',
                    name: 'masterPassword',
                    message: 'Create a master password:',
                    mask: '*',
                    validate: input => input.length >= 6 || 'Password must be at least 6 characters long.'
                },
                {
                    type: 'password',
                    name: 'confirmPassword',
                    message: 'Confirm your master password:',
                    mask: '*',
                    validate: (input, answers) => {
                        if (input === answers.masterPassword) {
                            return true;
                        }
                        return 'Passwords do not match.';
                    }
                }
            ]);

            await keychain.init(masterPassword);
            await keychain.dump('keychain.json');
            console.log(chalk.green('New keychain created and saved successfully.'));
        } else {
            console.error(chalk.red('Failed to initialize keychain:'), err.message);
            process.exit(1);
        }
    }
}

/**
 * Displays the main menu and handles user selections.
 */
async function mainMenu() {
    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Select an action:',
                choices: [
                    'Add a password',
                    'Retrieve a password',
                    'Remove a password',
                    'List all websites',
                    new inquirer.Separator(),
                    'Exit'
                ]
            }
        ]);

        switch (action) {
            case 'Add a password':
                await addPassword();
                break;
            case 'Retrieve a password':
                await retrievePassword();
                break;
            case 'Remove a password':
                await removePassword();
                break;
            case 'List all websites':
                await listWebsites();
                break;
            case 'Exit':
                console.log(chalk.blue('Goodbye!'));
                process.exit(0);
        }
    }
}

/**
 * Prompts the user to add a new website-password entry.
 */
async function addPassword() {
    const { website, password } = await inquirer.prompt([
        {
            type: 'input',
            name: 'website',
            message: 'Enter the website URL or name:',
            validate: input => input.trim() !== '' || 'Website cannot be empty.'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter the password:',
            mask: '*',
            validate: input => input.length > 0 || 'Password cannot be empty.'
        }
    ]);

    try {
        await keychain.set(website.trim(), password);
        await keychain.dump('keychain.json');
        console.log(chalk.green(`Password for "${website}" added successfully.`));
    } catch (err) {
        console.error(chalk.red('Failed to add password:'), err.message);
    }
}

/**
 * Prompts the user to retrieve a password for a specific website.
 */
async function retrievePassword() {
    const { website } = await inquirer.prompt([
        {
            type: 'input',
            name: 'website',
            message: 'Enter the website URL or name to retrieve the password:',
            validate: input => input.trim() !== '' || 'Website cannot be empty.'
        }
    ]);

    try {
        const password = await keychain.get(website.trim());
        console.log(chalk.green(`Password for "${website}": ${password}`));
    } catch (err) {
        console.error(chalk.red(err.message));
    }
}

/**
 * Prompts the user to remove a password entry for a specific website.
 */
async function removePassword() {
    const { website } = await inquirer.prompt([
        {
            type: 'input',
            name: 'website',
            message: 'Enter the website URL or name to remove the password:',
            validate: input => input.trim() !== '' || 'Website cannot be empty.'
        }
    ]);

    try {
        await keychain.remove(website.trim());
        await keychain.dump('keychain.json');
        console.log(chalk.green(`Password for "${website}" removed successfully.`));
    } catch (err) {
        console.error(chalk.red(err.message));
    }
}

/**
 * Lists all websites stored in the keychain.
 */
async function listWebsites() {
    const websites = Object.keys(keychain.kvs.data);
    if (websites.length === 0) {
        console.log(chalk.yellow('No passwords stored.'));
    } else {
        console.log(chalk.blue('Stored Websites:'));
        websites.forEach((site, index) => {
            console.log(`${index + 1}. ${site}`);
        });
    }
}

/**
 * Entry point of the CLI application.
 */
async function run() {
    console.log(chalk.cyan.bold('Welcome to the Secure Password Manager CLI'));
    await initializeKeychain();
    await mainMenu();
}

run();
