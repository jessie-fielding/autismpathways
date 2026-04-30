/**
 * Patches expo-crypto v55 to remove the ExpoCryptoAES native module requirement.
 * This module was added in expo-crypto v55 but is not compiled into Expo SDK 54 iOS builds.
 * We replace it with a safe stub so the app doesn't crash on launch.
 */
const fs = require('fs');
const path = require('path');

const stub = `// Patched by scripts/patch-expo-crypto.js
// ExpoCryptoAES native module is not available in Expo SDK 54 builds.
const stub = {
  EncryptionKey: class EncryptionKey {},
  SealedData: class SealedData {
    static fromParts() { return new this(); }
    static fromCombined() { return new this(); }
  },
  encryptAsync: () => Promise.reject(new Error('AES encryption not available')),
  decryptAsync: () => Promise.reject(new Error('AES decryption not available')),
};
export default stub;
`;

// Find all copies of ExpoCryptoAES.js in node_modules
const possiblePaths = [
  path.join(__dirname, '..', 'node_modules', 'expo-crypto', 'build', 'aes', 'ExpoCryptoAES.js'),
];

// Also search pnpm store
const pnpmBase = path.join(__dirname, '..', 'node_modules', '.pnpm');
if (fs.existsSync(pnpmBase)) {
  const dirs = fs.readdirSync(pnpmBase).filter(d => d.startsWith('expo-crypto@'));
  for (const dir of dirs) {
    possiblePaths.push(
      path.join(pnpmBase, dir, 'node_modules', 'expo-crypto', 'build', 'aes', 'ExpoCryptoAES.js')
    );
  }
}

let patched = 0;
for (const filePath of possiblePaths) {
  try {
    if (fs.existsSync(filePath)) {
      const current = fs.readFileSync(filePath, 'utf8');
      if (current.includes('requireNativeModule')) {
        fs.writeFileSync(filePath, stub);
        console.log(`✅ Patched: ${filePath}`);
        patched++;
      } else {
        console.log(`⏭  Already patched: ${filePath}`);
      }
    }
  } catch (e) {
    console.error(`❌ Failed to patch ${filePath}: ${e.message}`);
  }
}

if (patched === 0) {
  console.log('ℹ️  No files needed patching (expo-crypto may be the correct version).');
}
