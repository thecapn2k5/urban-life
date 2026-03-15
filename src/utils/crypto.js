import CryptoJS from 'crypto-js';

// Encrypt data using a PIN/Password
export const encryptData = (data, pin) => {
  if (!data) return data;
  try {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, pin).toString();
  } catch (e) {
    console.error('Encryption failed', e);
    return null;
  }
};

// Decrypt data using the PIN
export const decryptData = (encryptedData, pin) => {
  if (!encryptedData) return encryptedData;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, pin);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) throw new Error('Bad Decryption Key');
    return JSON.parse(decryptedStr);
  } catch (e) {
    throw new Error('Incorrect PIN or corrupted data.');
  }
};

// Hash a PIN to save it for verification
export const hashPin = (pin) => {
  return CryptoJS.SHA256(pin).toString();
};
