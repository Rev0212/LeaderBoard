const crypto = require('crypto');

const generateRandomPassword = (length = 10) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    return Array.from(crypto.randomFillSync(new Uint32Array(length)))
        .map(x => chars[x % chars.length])
        .join('');
};

module.exports = { generateRandomPassword };