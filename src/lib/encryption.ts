import CryptoJS from 'crypto-js';

/**
 * Encrypts a message using AES encryption with the provided room key
 * @param message - The plain text message to encrypt
 * @param roomKey - The room key used as encryption key
 * @returns The encrypted message as a string
 */
export function encryptMessage(message: string, roomKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(message, roomKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypts a message using AES decryption with the provided room key
 * @param encryptedMessage - The encrypted message to decrypt
 * @param roomKey - The room key used as decryption key
 * @returns The decrypted plain text message
 */
export function decryptMessage(encryptedMessage: string, roomKey: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, roomKey);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      throw new Error('Failed to decrypt message - invalid key or corrupted data');
    }
    
    return plaintext;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Generates a cryptographically secure random room key
 * @returns A random UUID-like string to be used as room key
 */
export function generateRoomKey(): string {
  // Generate a secure random string using crypto-js
  const randomBytes = CryptoJS.lib.WordArray.random(32); // 256 bits
  return randomBytes.toString(CryptoJS.enc.Hex);
}

/**
 * Generates a random anonymous user identifier
 * @returns A random user identifier
 */
export function generateUserId(): string {
  const adjectives = ['Anonymous', 'Silent', 'Quiet', 'Mysterious', 'Hidden', 'Secret', 'Phantom', 'Shadow', 'Whisper', 'Echo'];
  const nouns = ['User', 'Visitor', 'Guest', 'Stranger', 'Friend', 'Sender', 'Writer', 'Voice', 'Mind', 'Soul'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}${noun}${number}`;
}