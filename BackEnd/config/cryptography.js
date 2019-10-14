const crypto = require('crypto');

const cryptoData = {
  algorithm: 'aes-256-cbc',
  key: '1e119927a87f98da98112f7ed18ea71e4144610f60e7e1486844821eadd899a6',
  iv: '89f6b86078f74a2a1735e81f1f711a10',
  type: 'hex'
};

const encrypt = function (password) {
  const {
    algorithm, key, iv, type
  } = cryptoData;
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, type), Buffer.from(iv, type));
  let encrypted = cipher.update(password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString(type);
};

function decrypt(password) {
  const {
    algorithm, key, iv, type
  } = cryptoData;
  const encryptedText = Buffer.from(password, type);
  const decipher = crypto.createDecipheriv(
    algorithm, Buffer.from(key, type), Buffer.from(iv, type)
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}


module.exports = {
  encrypt,
  decrypt
};
