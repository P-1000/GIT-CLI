import { execSync } from 'child_process';

const getCommitHistory = () => {
  const commitHistory = execSync('git log --oneline --graph --decorate').toString();
  return commitHistory;
};

const visualizeCommitHistory = () => {
  const commitHistory = getCommitHistory();
  console.log(commitHistory);
};

visualizeCommitHistory();
