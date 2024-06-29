import { readFileSync } from "fs";
import hljs from "cli-highlight";

// List of patterns to detect private keys in a JavaScript file
const PRIVATE_KEY_PATTERNS = [
  /api[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /private[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /password\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /secret\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /access[_-]?token\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /-----BEGIN (RSA|DSA|EC|PGP|OPENSSH) PRIVATE KEY-----/g,
];

/**
 * Detects private keys in a JavaScript file.
 * @param {string} filePath - Path to the JavaScript file to check.
 * @returns {boolean} - Returns true if private keys are found, false otherwise.
 */
export const detectPrivateKeys = (filePath) => {
  console.log(`Checking file: ${filePath}`)
  try {
    const fileContent = readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");
    let hasPrivateKeys = false;

    lines.forEach((line, index) => {
      PRIVATE_KEY_PATTERNS.forEach((pattern) => {
        if (pattern.test(line)) {
          hasPrivateKeys = true;
        }
      });
    });

    return hasPrivateKeys;
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return false;
  }
};
