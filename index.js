#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import { displayModifiedFiles, selectBranchAndCommit, executeCommitWorkflow } from './commitUtils.js';
import { execSync } from "child_process";
import { detectPrivateKeys } from "./private-key-detect.js";

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

    for (const file of files) {
      if (detectPrivateKeys(file)) {
        console.log(chalk.red(`Private key detected in ${file}. Commit aborted.`));
        return true;
      }
    }

    console.log(chalk.green("No sensitive information found."));
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

main();
