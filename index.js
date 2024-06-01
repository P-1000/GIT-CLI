#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import { displayModifiedFiles, selectBranchAndCommit, executeCommitWorkflow } from './commitUtils.js';

const main = async () => {
  console.log(chalk.green(figlet.textSync('Jutsu-Git', { horizontalLayout: 'full' })));
  try {
    displayModifiedFiles();
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
