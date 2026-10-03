const crypto = require('crypto');

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

/**
 * Generates a random alphanumeric code of specified length.
 * Default 10 characters from lowercase alphabet + numbers.
 */
function generateProjectCode(length = 10) {
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

module.exports = { generateProjectCode };
