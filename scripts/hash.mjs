import crypto from 'crypto';

const ITERATIONS = 1000;
const KEYLEN = 32;

function toB64(buf) {
  return Buffer.from(buf).toString('base64');
}

function derive(password, salt, iterations) {
  return crypto.pbkdf2Sync(password, salt, iterations, KEYLEN, 'sha256');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const bits = derive(password, salt, ITERATIONS);
  console.log(`pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(bits)}`);
}

hashPassword("admin123");
