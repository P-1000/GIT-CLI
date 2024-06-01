import chalk from "chalk";
import { executeCommand } from "./gitUtils.js";
import { promptBranchAndCommit } from "./promptUtils.js";
import getCommitMessage from "./Gemini.js";

export const displayModifiedFiles = () => {
  try {
    const output = executeCommand("git status --short");
    const modifiedFiles = output
      .split("\n")
      .filter((line) => line.startsWith(" M "))
      .map((line) => line.replace(" M ", ""))
      .join("\n");
    console.log(
      modifiedFiles
        ? chalk.bgCyan.white.bold("Modified Files:\n" + modifiedFiles)
        : chalk.bgGreen.white.bold("No modified files.")
    );
  } catch (error) {
    console.error(
      `${chalk.bgRed.white.bold("Error executing git status:")} ${
        error.message
      }`
    );
  }
};

export const selectBranchAndCommit = async () => {
  const output = executeCommand("git branch --list");
  const branches = output.split("\n").map((branch) => branch.trim());
  return await promptBranchAndCommit(branches);
};

export const executeCommitWorkflow = async (branch, commitMessage) => {
  executeCommand("git add .");
  console.log(chalk.green("Added all changes for commit."));
  const diffInput = executeCommand("git diff --cached");
  const commitMessageFromAI = await getCommitMessage(diffInput);
  const sanitizedCommitMessage = commitMessageFromAI.replace(/"/g, '\\"');
  executeCommand(`git commit -m "${sanitizedCommitMessage}"`);
  executeCommand(`git push origin ${branch.slice(2)}`);
  console.log(chalk.magenta(`Pushed changes to branch ${branch}.`));
};
