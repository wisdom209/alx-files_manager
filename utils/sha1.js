const hasher = require('sha1');

function sha1Hash(password) {
  const passHash = hasher(password);
  return passHash;
}

module.exports = sha1Hash;
