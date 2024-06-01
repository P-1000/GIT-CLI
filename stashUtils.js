import chalk from 'chalk';
import { executeCommand } from './gitUtils.js';
import inquirer from 'inquirer';

export const listStashes = () => {
  try {
    const output = executeCommand('git stash list');
    if (output) {
      console.log(chalk.bold.green('List of Stashes:'));
      console.log(output);
    } else {
      console.log(chalk.yellow('No stashes found.'));
    }
  } catch (error) {
    console.error(chalk.red.bold('Error listing stashes:'), error.message);
  }
};

export const applyStash = async () => {
  try {
    const stashes = executeCommand('git stash list').split('\n');
    const { stashIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stashIndex',
        message: 'Select the stash to apply:',
        choices: stashes.map((stash, index) => ({ name: stash, value: index })),
      },
    ]);
    const output = executeCommand(`git stash apply stash@{${stashIndex}}`);
    console.log(chalk.green.bold('Stash applied successfully:'), output);
  } catch (error) {
    console.error(chalk.red.bold('Error applying stash:'), error.message);
  }
};

export const dropStash = async () => {
  try {
    const stashes = executeCommand('git stash list').split('\n');
    const { stashIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stashIndex',
        message: 'Select the stash to drop:',
        choices: stashes.map((stash, index) => ({ name: stash, value: index })),
      },
    ]);
    executeCommand(`git stash drop stash@{${stashIndex}}`);
    console.log(chalk.green.bold('Stash dropped successfully.'));
  } catch (error) {
    console.error(chalk.red.bold('Error dropping stash:'), error.message);
  }
};
