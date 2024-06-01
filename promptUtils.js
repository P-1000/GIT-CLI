import inquirer from 'inquirer';

export const promptBranchAndCommit = async (branches) => {
  try {
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
