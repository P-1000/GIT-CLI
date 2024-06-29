import { execSync } from 'child_process';

export const executeCommand = (command) => {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf-8' }).trim();
  } catch (error) {
    throw new Error(`Error executing command "${command}": ${error.message}`);
  }
};


