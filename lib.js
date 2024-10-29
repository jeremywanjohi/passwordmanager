// lib.js

"use strict";

/**
 * Converts a string to a Uint8Array buffer.
 *
 * @param {string} str - The string to convert.
 * @returns {Uint8Array} - The resulting buffer.
 */
function stringToBuffer(str) {
  return new TextEncoder().encode(str);
}

/**
 * Converts a buffer to a string.
 *
 * @param {Uint8Array} buffer - The buffer to convert.
 * @returns {string} - The resulting string.
 */
function bufferToString(buffer) {
  return new TextDecoder().decode(buffer);
}

/**
 * Encodes a buffer to a Base64 string.
 *
 * @param {Uint8Array} buffer - The buffer to encode.
 * @returns {string} - The Base64 encoded string.
 */
function encodeBuffer(buffer) {
  return Buffer.from(buffer).toString("base64");
}

/**
 * Decodes a Base64 string to a buffer.
 *
 * @param {string} str - The Base64 string to decode.
 * @returns {Uint8Array} - The resulting buffer.
 */
function decodeBuffer(str) {
  return new Uint8Array(Buffer.from(str, "base64"));
}

/**
 * Generates random bytes.
 *
 * @param {number} length - The number of random bytes to generate.
 * @returns {Uint8Array} - The random bytes.
 */
function getRandomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}

module.exports = {
  stringToBuffer,
  bufferToString,
  encodeBuffer,
  decodeBuffer,
  getRandomBytes,
};
