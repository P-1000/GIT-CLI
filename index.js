#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import getCommitMessage from './Gemini.js';

inquirer.registerPrompt('autocomplete', autocomplete);

const executeCommand = (command) => {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf-8' }).trim();
  } catch (error) {
    throw new Error(`Error executing command "${command}": ${error.message}`);
  }
};

const displayModifiedFiles = () => {
  try {
    const modifiedFiles = executeCommand('git status --short')
      .split('\n')
      .filter((line) => line.startsWith(' M '))
      .map((line) => line.replace(' M ', ''))
      .join('\n');

    console.log(modifiedFiles ? chalk.bgCyan.white.bold('Modified Files:\n' + modifiedFiles) : chalk.bgGreen.white.bold('No modified files.'));
  } catch (error) {
    console.error(`${chalk.bgRed.white.bold('Error executing git status:')} ${error.message}`);
  }
};

const selectBranchAndCommit = async () => {
  try {
    const branches = executeCommand('git branch --list')
      .split('\n')
      .map((branch) => branch.trim());

    const { branch, commitMessage } = await inquirer.prompt([
      {
        type: 'list',
        name: 'branch',
        message: 'Select a branch to commit to:',
        choices: branches,
      },
      {
        type: 'input',
        name: 'commitMessage',
        message: 'Enter commit message (Press Enter and AI will Generate it for you):',
      },
    ]);

    return { branch, commitMessage };
  } catch (error) {
    throw new Error(`Error prompting for branch and commit: ${error.message}`);
  }
};

const main = async () => {

  console.log(chalk.green(figlet.textSync('Jutsu-Git', { horizontalLayout: 'full' })));
  try {
    displayModifiedFiles();
    const { branch, commitMessage } = await selectBranchAndCommit();
    console.log(chalk.yellow(`Branch selected: ${branch}`));
    console.log(chalk.yellow(`Commit message: ${commitMessage}`));

    // Git Add
    executeCommand('git add .');
    console.log(chalk.green('Added all changes for commit.'));

    const diffInput = executeCommand('git diff --cached');
    const commitMessageFromAI = await getCommitMessage(diffInput);

    // Git Commit
    const sanitizedCommitMessage = commitMessageFromAI.replace(/"/g, '\\"'); // Escape double quotes
    executeCommand(`git commit -m "${sanitizedCommitMessage}"`);

    // Git Push
    executeCommand(`git push origin ${branch.slice(2)}`);
    console.log(chalk.magenta(`Pushed changes to branch ${branch}.`));

    console.log(chalk.green('Done!'));
  } catch (error) {
    console.error(`${chalk.bgRed.white('Error executing script:')} ${error.message}`);
  }
};

main();
