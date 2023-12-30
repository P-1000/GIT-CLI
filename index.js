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



const displayFileDiffs = () => {
  try {
    const diffOutput = executeCommand('git diff | less -R');
    
    if (!diffOutput) {
      console.log(chalk.bgGreen.white.bold('No changes to be committed.'));
    }
  } catch (error) {
    console.error(`${chalk.bgRed.white.bold('Error executing git diff:')} ${error.message}`);
  }
};

// ...


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


const displayLoadingAnimation = () => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let currentFrame = 0;

  return setInterval(() => {
    process.stdout.write(chalk.green(frames[currentFrame] + ' Working... \r'));
    currentFrame = (currentFrame + 1) % frames.length;
  }, 100);
};



const displayCommitHistory = () => {
  try {
    const commitHistory = executeCommand('git log --oneline --decorate --graph');

    if (commitHistory) {
      console.log(chalk.bgYellow.black.bold('Commit History:'));
      console.log(commitHistory);
    } else {
      console.log(chalk.bgGreen.white.bold('No commit history.'));
    }
  } catch (error) {
    console.error(`${chalk.bgRed.white.bold('Error retrieving commit history:')} ${error.message}`);
  }
};

const main = async () => {
  console.log(chalk.green(figlet.textSync('Jutsu-Git', { horizontalLayout: 'full' })));

  try {
    // displayModifiedFiles();

    // Display file differences before committing
    // displayFileDiffs();

    // Display commit history
    // displayCommitHistory();

    const { branch, commitMessage } = await promptForBranchAndCommit();

    const defaultBranchName = 'main';
    const finalBranchName = branch || defaultBranchName;
    const defaultCommitMessage = 'Default commit message';
    const finalCommitMessage = commitMessage.trim() || defaultCommitMessage;

    console.log(chalk.red('Branch: ') + chalk.cyan(finalBranchName));

    console.log(chalk.green(figlet.textSync('Wait Bro!', { horizontalLayout: 'full' })));

    try {
      //  Git Add
      const addLoadingInterval = displayLoadingAnimation();
      executeCommand('git add .');
      clearInterval(addLoadingInterval);
      console.log(chalk.bgGreen.black.bold('Git add completed successfully! Staged changes for commit.'));

      //  Git Commit
      const commitLoadingInterval = displayLoadingAnimation();
      executeCommand(`git commit -m "${finalCommitMessage}"`);
      clearInterval(commitLoadingInterval);
      console.log(chalk.bgBlue.white.bold('Git commit completed successfully! Created a new commit with the staged changes.'));

      // Git Push
      const pushLoadingInterval = displayLoadingAnimation();
      executeCommand(`git push origin ${encodeURIComponent(finalBranchName)}`);
      clearInterval(pushLoadingInterval);
      console.log(chalk.bgMagenta.white.bold.underline('Git push completed successfully! Pushed the new commit to the remote repository.'));
    } catch (error) {
      console.error(`${chalk.bgRed.white.bold('Error executing git commands:')} ${error.message}`);
    }
  } catch (error) {
    console.error(`${chalk.bgRed.white('Error executing script:')} ${error.message}`);
  }
};

main();




