#!/usr/bin/env node
import chalk from "chalk";
import figlet from "figlet";
import readline from "readline";
import { execSync } from "child_process";
import OpenAI from "openai";




const openai = new OpenAI({
  apiKey: "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"
});

async function runCompletion () {
  const completion = await openai.completions.create({
    model: "text-davinci-003",
    prompt: "How are you today?",
  });
  console.log(completion.choices[0].text);
  }

const main = () => {
  // runCompletion();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(chalk.green(figlet.textSync("Jutsu-Git", { horizontalLayout: "full" })));

  try {
    // Use Git to list all branches
    const branches = execSync("git branch --list")
      .toString()
      .split("\n")
      .map((branch) => branch.trim());

    console.log(chalk.bgBlue.white.bold("Available Branches:"));
    branches.forEach((branch) => console.log(`- ${branch}`));

    rl.question("Enter commit message (or press Enter for default): ", (commitMessage) => {
      rl.question("Enter the branch name you want to commit to (or press Enter for default): ", (branchName) => {
        rl.close();

        const defaultCommitMessage = "Default commit message";
        const defaultBranchName = "main";
        const finalCommitMessage = commitMessage.trim() || defaultCommitMessage;
        const finalBranchName = branchName.trim() || defaultBranchName;

        console.log(chalk.yellow("Committing changes..."));

        try {
          execSync(`git add . && git commit -m "${finalCommitMessage}" && git push origin ${finalBranchName}`);
          console.log(chalk.bgGreen.white.bold("Git added, committed, and pushed successfully!"));
        } catch (error) {
          console.error(`${chalk.bgRed.white.bold("Error executing git commands:")} ${error.message}`);
        }
      });
    });
  } catch (error) {
    console.error(`${chalk.bgRed.white("Error executing git commands:")} ${error.message}`);
  }
};

main();
