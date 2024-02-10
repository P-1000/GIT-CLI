import { GoogleGenerativeAI } from "@google/generative-ai";
import chalk from "chalk";



const API_KEY = "AIzaSyDkVHUDN95kPp9-yADpuxhGnB4scKTDcyw";
const genAI = new GoogleGenerativeAI(API_KEY);

async function getCommitMessage(diffinput) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  Write a commit message for the following changes:\n
  ${diffinput}\n
  Make it short and include the main changes and some technical details and references if needed, but keep it clear.\n\n
  If you have added a new feature, you can write something like:\n
  'Add new feature: [feature name]'\n\n
  If you have fixed a bug, you can write something like:\n
  'Fix bug: [bug name]'\n\n
  If you have refactored some code, you can write something like:\n
  'Refactor code: [refactor name]'\n\n
  If you have updated some code, you can write something like:\n
  'Update code: [update name]'\n\n
  If you have deleted some code, you can write something like:\n
  'Delete code: [delete name]'\n\n
  If you have added some tests, you can write something like:\n
  'Add tests: [test name]'\n\n
  If you have updated some tests, you can write something like:\n
  'Update tests: [test name]'\n\n
  If you have deleted some tests, you can write something like:\n
  'Delete tests: [test name]'\n\n
  If you have updated the documentation, you can write something like:\n
  'Update documentation: [documentation name]'\n\n
  If you have fixed some documentation, you can write something like:\n
  'Fix documentation: [documentation name]'\n\n
  If you have updated a function, you can write something like:\n
  'Update function: [function name]'
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(chalk.white.bold(`AI Generated Commit Message:\n${text}`));
}

export default getCommitMessage;
