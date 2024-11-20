// script.js

import PasswordManager from './password-manager.js';

// Instantiate PasswordManager
const passwordManager = new PasswordManager();

// DOM Elements
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');

const initializeBtn = document.getElementById('initialize-btn');
const masterPasswordInput = document.getElementById('master-password');
const loginMessage = document.getElementById('login-message');

const addPasswordBtn = document.getElementById('add-password-btn');
const domainInput = document.getElementById('domain-input');
const passwordInput = document.getElementById('password-input');

const retrievePasswordBtn = document.getElementById('retrieve-password-btn');
const retrieveDomainInput = document.getElementById('retrieve-domain-input');
const retrievedPasswordDiv = document.getElementById('retrieved-password');

const removePasswordBtn = document.getElementById('remove-password-btn');
const removeDomainInput = document.getElementById('remove-domain-input');

const exportDataBtn = document.getElementById('export-data-btn');
const importDataInput = document.getElementById('import-data-input');
const importDataBtn = document.getElementById('import-data-btn');
const clearDataBtn = document.getElementById('clear-data-btn');

const appMessage = document.getElementById('app-message');

/**
 * Utility function to check if a keychain exists in localStorage.
 * @returns {boolean}
 */
function keychainExists() {
    const data = localStorage.getItem('passwordManagerData');
    return data !== null;
}

/**
 * Sets up the login container based on whether a keychain exists.
 */
function setupLogin() {
    if (keychainExists()) {
        initializeBtn.textContent = 'Unlock';
        const info = document.createElement('p');
        info.id = 'login-info';
        info.textContent = 'Enter your existing master password to unlock.';
        info.style.textAlign = 'center';
        info.style.color = '#555';
        loginContainer.insertBefore(info, masterPasswordInput);
    } else {
        initializeBtn.textContent = 'Initialize';
        const existingInfo = document.getElementById('login-info');
        if (existingInfo) {
            existingInfo.remove();
        }
    }
}

// Initialize login on page load
setupLogin();

// Initialize Button Event
initializeBtn.addEventListener('click', async () => {
    const masterPassword = masterPasswordInput.value.trim();
    if (!masterPassword) {
        loginMessage.textContent = 'Master password cannot be empty.';
        return;
    }

    try {
        if (keychainExists()) {
            // Unlock existing keychain
            await passwordManager.init(masterPassword);
            loginContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            loginMessage.textContent = '';
            appMessage.textContent = 'Password Manager unlocked successfully!';
            appMessage.style.color = 'green';
        } else {
            // Initialize new keychain
            await passwordManager.init(masterPassword);
            loginContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            loginMessage.textContent = '';
            appMessage.textContent = 'Password Manager initialized successfully!';
            appMessage.style.color = 'green';
        }
    } catch (error) {
        loginMessage.textContent = error.message;
    }
});

// Add Password Event
addPasswordBtn.addEventListener('click', async () => {
    const domain = domainInput.value.trim();
    const password = passwordInput.value.trim();

    if (!domain || !password) {
        appMessage.textContent = 'Domain and password cannot be empty.';
        appMessage.style.color = 'red';
        return;
    }

    try {
        await passwordManager.addPassword(domain, password);
        appMessage.textContent = 'Password added successfully.';
        appMessage.style.color = 'green';
        domainInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        appMessage.textContent = error.message;
        appMessage.style.color = 'red';
    }
});

// Retrieve Password Event
retrievePasswordBtn.addEventListener('click', async () => {
    const domain = retrieveDomainInput.value.trim();

    if (!domain) {
        appMessage.textContent = 'Domain cannot be empty.';
        appMessage.style.color = 'red';
        return;
    }

    try {
        const password = await passwordManager.getPassword(domain);
        retrievedPasswordDiv.textContent = `Password for ${domain}: ${password}`;
        appMessage.textContent = '';
        retrievedPasswordDiv.style.color = '#333';
    } catch (error) {
        retrievedPasswordDiv.textContent = '';
        appMessage.textContent = error.message;
        appMessage.style.color = 'red';
    }
});

// Remove Password Event
removePasswordBtn.addEventListener('click', async () => {
    const domain = removeDomainInput.value.trim();

    if (!domain) {
        appMessage.textContent = 'Domain cannot be empty.';
        appMessage.style.color = 'red';
        return;
    }

    try {
        await passwordManager.removePassword(domain);
        appMessage.textContent = 'Password removed successfully.';
        appMessage.style.color = 'green';
        removeDomainInput.value = '';
    } catch (error) {
        appMessage.textContent = error.message;
        appMessage.style.color = 'red';
    }
});

// Export Data Event
exportDataBtn.addEventListener('click', () => {
    passwordManager.exportData();
    appMessage.textContent = 'Data exported successfully.';
    appMessage.style.color = 'green';
});

// Import Data Event
importDataBtn.addEventListener('click', async () => {
    const file = importDataInput.files[0];
    if (!file) {
        appMessage.textContent = 'Please select a JSON file to import.';
        appMessage.style.color = 'red';
        return;
    }

    try {
        await passwordManager.importData(file);
        appMessage.textContent = 'Data imported successfully. Please re-enter your master password to continue.';
        appMessage.style.color = 'green';
        // Reset the UI to prompt for master password again
        appContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        masterPasswordInput.value = '';
        retrievedPasswordDiv.textContent = '';
    } catch (error) {
        appMessage.textContent = error.message;
        appMessage.style.color = 'red';
    }

    // Reset the file input
    importDataInput.value = '';
});

// Clear All Data Event
clearDataBtn.addEventListener('click', () => {
    const confirmClear = confirm('Are you sure you want to clear all data? This action cannot be undone.');
    if (confirmClear) {
        passwordManager.clearAllData();
        appContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        masterPasswordInput.value = '';
        appMessage.textContent = '';
        retrievedPasswordDiv.textContent = '';
        const info = document.getElementById('login-info');
        if (info) {
            info.remove();
        }
        setupLogin();
        alert('All data has been cleared.');
    }
});
