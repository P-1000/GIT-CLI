#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import { displayModifiedFiles, selectBranchAndCommit, executeCommitWorkflow } from './commitUtils.js';
import { execSync } from "child_process";
import { readFileSync } from "fs";
import hljs from "cli-highlight";
import inquirer from 'inquirer';

// Sensitive information patterns
const SENSITIVE_PATTERNS = [
  /api[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /private[_-]?key\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /password\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /secret\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /access[_-]?token\s*[:=]\s*[\'"][^\'"]+[\'"]/gi,
  /-----BEGIN (RSA|DSA|EC|PGP|OPENSSH) PRIVATE KEY-----/g,
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

const checkForSensitiveInfo = async () => {
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

    for (const file of files) {
      if (checkSensitiveInfo(file)) {
        hasSensitiveInfo = true;
      }
    }

    if (hasSensitiveInfo) {
      console.log(chalk.red("Sensitive information detected."));
      const { proceed } = await inquirer.prompt({
        type: 'confirm',
        name: 'proceed',
        message: 'Sensitive information found. Do you want to proceed with the commit at your own risk?',
        default: false,
      });

      if (!proceed) {
        console.log(chalk.red("Commit aborted due to sensitive information."));
        return true;
      }
    }

    console.log(chalk.green("No sensitive information found or proceeding at user's risk."));
    return false;
  } catch (error) {
    console.error(chalk.red(`Error executing script: ${error.message}`));
    return true;
  }
};

const main = async () => {
  console.log(chalk.green(figlet.textSync('Jutsu-Git', { horizontalLayout: 'full' })));
  try {
    displayModifiedFiles();

    if (await checkForSensitiveInfo()) {
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

main();
