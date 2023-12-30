#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';

inquirer.registerPrompt('autocomplete', autocomplete);

const executeCommand = (command) => {
  try {
    const result = execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return result.trim();
  } catch (error) {
    throw new Error(`Error executing command "${command}": ${error.message}`);
  }
};

const displayModifiedFiles = () => {
  try {
    const statusOutput = executeCommand('git status --short');
    const modifiedFiles = statusOutput
      .split('\n')
      .filter((line) => line.startsWith(' M '))
      .map((line) => line.replace(' M ', ''))
      .join('\n');

    if (modifiedFiles) {
      console.log(chalk.bgCyan.white.bold('Modified Files:'));
      console.log(modifiedFiles);
    } else {
      console.log(chalk.bgGreen.white.bold('No modified files.'));
    }
  } catch (error) {
    console.error(`${chalk.bgRed.white.bold('Error executing git status:')} ${error.message}`);
  }
};

const promptForBranchAndCommit = async () => {
  try {
    const branches = executeCommand('git branch --list')
      .split('\n')
      .map((branch) => branch.trim());

    const branchPrompt = inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'branch',
        message: 'Select a branch to commit to:',
        source: (answersSoFar, input) => {
          input = input || '';
          return branches.filter((branch) => branch.includes(input));
        },
        result(name) {
          return this.focused ? chalk.cyan(name) : name;
        },
      },
      {
        type: 'input',
        name: 'commitMessage',
        message: 'Enter commit message (or press Enter for default):',
      },
    ]);

    return await branchPrompt;
  } catch (error) {
    throw new Error(`Error prompting for branch and commit: ${error.message}`);
  }
};

// ...

const main = async () => {
  console.log(chalk.green(figlet.textSync('Jutsu-Git', { horizontalLayout: 'full' })));

  try {
    displayModifiedFiles();

    const { branch, commitMessage } = await promptForBranchAndCommit();

    const defaultBranchName = 'main';
    const finalBranchName = branch || defaultBranchName;
    const defaultCommitMessage = 'Default commit message';
    const finalCommitMessage = commitMessage.trim() || defaultCommitMessage;

    console.log(chalk.red('Branch: ') + chalk.cyan(finalBranchName));

    console.log(chalk.green(figlet.textSync('Wait Bro!', { horizontalLayout: 'full' })));

    try {
      executeCommand('git add .');
      executeCommand(`git commit -m "${finalCommitMessage}"`);

     
      executeCommand(`git push origin ${encodeURIComponent(finalBranchName)}`);
      console.log(chalk.bgGreen.white.bold('Git added, committed, and pushed successfully!'));
    } catch (error) {
      console.error(`${chalk.bgRed.white.bold('Error executing git commands:')} ${error.message}`);
    }
  } catch (error) {
    console.error(`${chalk.bgRed.white('Error executing script:')} ${error.message}`);
  }
};


main();
