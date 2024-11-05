/**
 * Pads the password to a fixed length using a predefined method.
 * @param {string} password - The original password.
 * @param {number} length - The desired fixed length.
 * @returns {string} - The padded password.
 */
function padPassword(password, length) {
  if (password.length > length) {
      return password.slice(0, length);
  }
  return password.padEnd(length, '\0'); // Pad with null characters
}

/**
* Removes padding from the password.
* @param {string} paddedPassword - The padded password.
* @returns {string} - The original password without padding.
*/
function unpadPassword(paddedPassword) {
  return paddedPassword.replace(/\0+$/, '');
}

module.exports = {
  padPassword,
  unpadPassword
};