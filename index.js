#!/usr/bin/env node
import chalk from "chalk";
import figlet from "figlet";
import {
  displayModifiedFiles,
  selectBranchAndCommit,
  executeCommitWorkflow,
} from "./commitUtils.js";
import { execSync } from "child_process";
import { detectPrivateKeys } from "./private-key-detect.js";
import inquirer from "inquirer";

const checkForSensitiveInfo = async () => {
  console.log(
    chalk.yellow("Checking for sensitive information in staged files...")
  );
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
        console.log(chalk.red(`Private key detected in ${file}.`));

        const answer = await inquirer.prompt({
          type: "confirm",
          name: "proceed",
          message: `Private key detected in ${file}. Do you want to proceed with the commit at your own risk?`,
          default: false,
        });

        if (!answer.proceed) {
          console.log(chalk.red("Commit aborted."));
          return true;
        }

        console.log(chalk.yellow("Proceeding with commit at user's risk."));
        hasSensitiveInfo = true; // Considered as sensitive info found, but user decided to proceed
      }
    }

    if (hasSensitiveInfo) {
      console.log(
        chalk.yellow("Committing changes with sensitive information.")
      );
    } else {
      console.log(chalk.green("No sensitive information found."));
    }

    return false;
  } catch (error) {
    console.error(chalk.red(`Error executing script: ${error.message}`));
    return true;
  }
};

const main = async () => {
  console.log(
    chalk.green(figlet.textSync("Jutsu-Git", { horizontalLayout: "full" }))
  );
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
    console.log(chalk.green("Done!"));
  } catch (error) {
    console.error(
      `${chalk.bgRed.white("Error executing script:")} ${error.message}`
    );
    process.exitCode = 1;
  }
};

const apiKey = "my_api_key";
const privateKey = process.env.PRIVATE_KEY;
const password = "my_password";

main();
