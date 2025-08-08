import CryptoJS from 'crypto-js';

/**
 * Encrypts a message using AES encryption with the provided room key
 * @param message - The plain text message to encrypt
 * @param roomKey - The room key used as encryption key
 * @returns The encrypted message as a string
 */
export function encryptMessage(message: string, roomKey: string): string {
  try {
    const encryptionKey = deriveEncryptionKey(roomKey);
    const encrypted = CryptoJS.AES.encrypt(message, encryptionKey).toString();
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
    const encryptionKey = deriveEncryptionKey(roomKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
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
 * Generates a short, memorable room key for easy sharing
 * @returns A 6-character alphanumeric string (e.g., "A4B9K2")
 */
export function generateRoomKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like I, L, O, 0, 1
  let result = '';
  
  // Generate 6 random characters for easy word-of-mouth sharing
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generates a cryptographically secure encryption key from room key
 * @param roomKey - The short room key
 * @returns A secure encryption key derived from the room key
 */
export function deriveEncryptionKey(roomKey: string): string {
  // Use PBKDF2 to derive a strong encryption key from the short room key
  const salt = 'OneTC-Salt-2024'; // Static salt for consistency
  const key = CryptoJS.PBKDF2(roomKey, salt, {
    keySize: 256/32, // 256 bits
    iterations: 10000
  });
  return key.toString(CryptoJS.enc.Hex);
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