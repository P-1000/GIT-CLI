#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import { displayModifiedFiles, selectBranchAndCommit, executeCommitWorkflow } from './commitUtils.js';
import { execSync } from "child_process";
import { readFileSync } from "fs";
import hljs from "cli-highlight";

// Sensitive information patterns
const SENSITIVE_PATTERNS = [
  /api[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]/gi, // API keys
  /private[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]/gi, // Private keys
  /password\s*[:=]\s*[\'"][^\'"]+[\'"]/gi, // Passwords
  /secret\s*[:=]\s*[\'"][^\'"]+[\'"]/gi, // Secrets
  /access[_-]?token\s*[:=]\s*[\'"][^\'"]+[\'"]/gi, // Access tokens
  /-----BEGIN (RSA|DSA|EC|PGP|OPENSSH) PRIVATE KEY-----/g, // Private key blocks
];

const checkSensitiveInfo = (filePath) => {
  try {
    const fileContent = readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");
    let hasSensitiveInfo = false;

    lines.forEach((line, index) => {
      SENSITIVE_PATTERNS.forEach((pattern) => {
        if (pattern.test(line)) {
          if (!hasSensitiveInfo) {
            console.log(chalk.red(`Sensitive information found in ${filePath}:`));
            hasSensitiveInfo = true;
          }
          const highlightedLine = hljs.highlight(line, { language: 'javascript' });
          console.log(chalk.yellow(`Line ${index + 1}: ${highlightedLine}`));
        }
      });
    });

    return hasSensitiveInfo;
  } catch (error) {
    console.error(chalk.red(`Error reading file ${filePath}: ${error.message}`));
    return false;
  }
};

const checkForSensitiveInfo = () => {
  try {
    const changedFiles = execSync("git diff --cached --name-only", {
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();

    if (!changedFiles) {
      console.log(chalk.green("No files staged for commit."));
      return false;
    }

    const files = changedFiles.split("\n");
    let hasSensitiveInfo = false;

    files.forEach((file) => {
      if (checkSensitiveInfo(file)) {
        hasSensitiveInfo = true;
      }
    });

    if (hasSensitiveInfo) {
      console.log(chalk.red("Commit aborted due to sensitive information."));
      return true;
    } else {
      console.log(chalk.green("No sensitive information found."));
      return false;
    }
  } catch (error) {
    console.error(chalk.red(`Error executing script: ${error.message}`));
    return true;
  }
};

const main = async () => {
  console.log(chalk.green(figlet.textSync('Jutsu-Git', { horizontalLayout: 'full' })));
  try {
    displayModifiedFiles();

    // Check for sensitive information
    if (checkForSensitiveInfo()) {
      process.exitCode = 1;
      return;
    }

    const { branch, commitMessage } = await selectBranchAndCommit();
    console.log(chalk.yellow(`Branch selected: ${branch}`));
    console.log(chalk.yellow(`Commit message: ${commitMessage}`));
    await executeCommitWorkflow(branch, commitMessage);
    console.log(chalk.green('Done!'));
  } catch (error) {
    console.error(`${chalk.bgRed.white('Error executing script:')} ${error.message}`);
    process.exitCode = 1;
  }
};

const api = "hasdlfh"
main();
