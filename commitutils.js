import chalk from "chalk";
import { executeCommand } from "./gitUtils.js";
import { promptBranchAndCommit } from "./promptUtils.js";
import getCommitMessage from "./Gemini.js";

/**
 * Displays the modified files in the git repository.
 * @description This function displays the modified files in the git repository.
 * If there are no modified files, it displays a message indicating that there are no modified files.
 * If there are modified files, it displays the list of modified files.
 * @returns {void}
 * */

export const displayModifiedFiles = () => {
  try {
    const output = executeCommand("git status --short");
    const modifiedFiles = output
      .split("\n")
      .filter((line) => line.startsWith(" M "))
      .map((line) => line.replace(" M ", ""))
      .join("\n");
    console.log(chalk.bgGrey.white.bold("Modified Files:"));
    console.log(
      modifiedFiles
        ? chalk.bgCyan.white.bold(modifiedFiles)
        : chalk.bgGreen.white.bold("No modified files.")
    );
    console.log("");
  } catch (error) {
    console.error(
      `${chalk.bgRed.white.bold("Error executing git status:")} ${
        error.message
      }`
    );
  }
};

/*
 * @returns {Promise<{branch: string, commitMessage: string}>} - Branch and commit message selected by the user.
 */
export const selectBranchAndCommit = async () => {
  const output = executeCommand("git branch --list");
  const branches = output.split("\n").map((branch) => branch.trim());
  return await promptBranchAndCommit(branches);
};


// main execution flow of the commit workflow
export const executeCommitWorkflow = async (branch, commitMessage) => {
  executeCommand("git add .");
  console.log(chalk.green("Added all changes for commit."));
  const diffInput = executeCommand("git diff --cached");
  const commitMessageFromAI = await getCommitMessage(diffInput); // AI-generated commit message from Gemini
  const sanitizedCommitMessage = commitMessageFromAI.replace(/"/g, '\\"');
  executeCommand(`git commit -m "${sanitizedCommitMessage}"`);
  executeCommand(`git push origin ${branch.slice(2)}`);
  console.log(chalk.magenta(`Pushed changes to branch ${branch}.`));
};

