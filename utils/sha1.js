const crypto = require('crypto');

function sha1Hash(password) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(password);
  return sha1.digest('hex');
}

module.exports = sha1Hash;
