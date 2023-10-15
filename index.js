#!/usr/bin/env node
import chalk from "chalk";
import figlet from "figlet";
import { execSync } from "child_process";
import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";

inquirer.registerPrompt("autocomplete", autocomplete);

const displayGitStatus = () => {
  try {
    const statusOutput = execSync("git status").toString();
    console.log(chalk.bgCyan.white.bold("Git Status:"));
    console.log(statusOutput);
  } catch (error) {
    console.error(`${chalk.bgRed.white("Error executing git status:")} ${error.message}`);
  }
};

const main = async () => {
  // console.log(chalk.green(figlet.textSync("Jutsu-Git", { horizontalLayout: "full" }));

  try {
    displayGitStatus();

    const branches = execSync("git branch --list")
      .toString()
      .split("\n")
      .map((branch) => branch.trim());

    const branchPrompt = inquirer.prompt([
      {
        type: "autocomplete",
        name: "branch",
        message: "Select a branch to commit to:",
        source: (answersSoFar, input) => {
          input = input || "";
          return branches.filter((branch) => branch.includes(input));
        },
        result(name) {
          return this.focused ? chalk.cyan(name) : name;
        },
      },
      {
        type: "input",
        name: "commitMessage",
        message: "Enter commit message (or press Enter for default):",
      },
    ]);

    const { branch, commitMessage } = await branchPrompt;
    const defaultBranchName = "main";
    const finalBranchName = branch || defaultBranchName;
    const defaultCommitMessage = "Default commit message";
    const finalCommitMessage = commitMessage.trim() || defaultCommitMessage;

    console.log(chalk.yellow("Committing changes..."));

    try {
      execSync(`git add . && git commit -m "${finalCommitMessage}" && git push origin ${finalBranchName}`);
      console.log(chalk.bgGreen.white.bold("Git added, committed, and pushed successfully!"));
    } catch (error) {
      console.error(`${chalk.bgRed.white.bold("Error executing git commands:")} ${error.message}`);
    }
  } catch (error) {
    console.error(`${chalk.bgRed.white("Error executing git commands:")} ${error.message}`);
  }
};

main();
