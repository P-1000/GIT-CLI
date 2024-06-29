import { detectPrivateKeys } from "./private-key-detect.js";

const testFilePath = "./testFile.js";

console.log(`Checking file: ${testFilePath}`);
const hasPrivateKeys = detectPrivateKeys(testFilePath);

if (hasPrivateKeys) {
  console.log("Private keys detected.");
} else {
  console.log("No private keys found.");
}
