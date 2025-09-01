// Proper encryption/decryption utilities using Web Crypto API

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

// Generate a key from a password using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Get or generate master key for encryption
async function getMasterKey(): Promise<CryptoKey> {
  // In a real app, this would be derived from user's password/session
  // For now, we'll use a consistent key derived from a fixed password
  const password = 'envshare-master-key-2024'; // In real app, this would be user-specific
  const salt = new Uint8Array([
    0x73, 0x61, 0x6c, 0x74, 0x5f, 0x66, 0x6f, 0x72,
    0x5f, 0x65, 0x6e, 0x76, 0x73, 0x68, 0x61, 0x72
  ]); // Fixed salt for consistency
  
  return deriveKey(password, salt);
}

// Encrypt a string value
export async function encryptValue(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    const key = await getMasterKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      data
    );
    
    // Combine IV + encrypted data and encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 and add our prefix
    const base64 = btoa(String.fromCharCode(...combined));
    return `enc:${base64}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt value');
  }
}

// Decrypt a string value
export async function decryptValue(encryptedValue: string): Promise<string> {
  try {
    if (!encryptedValue.startsWith('enc:')) {
      throw new Error('Invalid encrypted value format');
    }
    
    const base64Data = encryptedValue.slice(4); // Remove 'enc:' prefix
    const combinedArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combinedArray.slice(0, IV_LENGTH);
    const encrypted = combinedArray.slice(IV_LENGTH);
    
    const key = await getMasterKey();
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt value');
  }
}

// Check if a value is encrypted
export function isEncryptedValue(value: string): boolean {
  return value.startsWith('enc:') && value.length > 4;
}

// Utility to safely handle encryption/decryption with fallbacks
export async function safeDecrypt(value: string): Promise<string> {
  if (!isEncryptedValue(value)) {
    return value; // Already plain text
  }
  
  try {
    return await decryptValue(value);
  } catch (error) {
    console.error('Safe decrypt failed:', error);
    return '[DECRYPTION FAILED]';
  }
}

export async function safeEncrypt(plaintext: string): Promise<string> {
  try {
    return await encryptValue(plaintext);
  } catch (error) {
    console.error('Safe encrypt failed:', error);
    // Return plain text if encryption fails
    return plaintext;
  }
}