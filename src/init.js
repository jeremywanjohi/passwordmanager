// src/init.js

"use strict";

/********* External Imports ********/
const cryptoWeb = require("crypto").webcrypto; // Import the entire webcrypto object
const { subtle } = cryptoWeb; // Destructure subtle for convenience
const { stringToBuffer, encodeBuffer } = require("../lib");

/********* Constants ********/
const PBKDF2_ITERATIONS = 100000; // Number of iterations for PBKDF2
const SALT_LENGTH = 16; // 128-bit salt
const HMAC_KEY_LENGTH = 32; // 256-bit HMAC key
const AES_KEY_LENGTH = 32; // 256-bit AES key

/********* Implementation ********/

/**
 * Initializes the keychain by deriving cryptographic keys using PBKDF2,
 * setting up the Key-Value Store (KVS), and caching derived keys.
 *
 * @param {string} password - The master password provided by the user.
 * @returns {Promise<Keychain>} - A promise that resolves to a new Keychain instance.
 */
async function initKeychain(password) {
  if (!password || typeof password !== "string") {
    throw "Invalid password provided for initialization.";
  }

  // Correctly use getRandomValues directly from cryptoWeb
  const salt = cryptoWeb.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Import the password as a key material
  const keyMaterial = await subtle.importKey(
    "raw",
    stringToBuffer(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive the HMAC key using PBKDF2
  const hmacKey = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: HMAC_KEY_LENGTH * 8 },
    false,
    ["sign", "verify"]
  );

  // Derive the AES-GCM key using PBKDF2
  const aesKey = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH * 8 },
    false,
    ["encrypt", "decrypt"]
  );

  // Export the derived keys to raw format for storage
  const exportedHmacKey = await subtle.exportKey("raw", hmacKey);
  const exportedAesKey = await subtle.exportKey("raw", aesKey);

  // Initialize the Key-Value Store (KVS) as an empty object
  const data = {};

  // Initialize the secrets object with HMAC and AES keys
  const secrets = {
    hmacKey: encodeBuffer(exportedHmacKey), // Base64 encoded
    aesKey: encodeBuffer(exportedAesKey),   // Base64 encoded
    salt: encodeBuffer(salt),               // Base64 encoded
  };

  // Return a new Keychain instance
  return new Keychain(data, secrets);
}

/********* Export ********/
module.exports = { initKeychain };
