import { GoogleGenerativeAI } from "@google/generative-ai";
import chalk from "chalk";

const API_KEY = "AIzaSyDkVHUDN95kPp9-yADpuxhGnB4scKTDcyw";
const genAI = new GoogleGenerativeAI(API_KEY);

async function getCommitMessage(diffinput) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Write a commit message for the following changes:\n
    ${diffinput}\n
    Please make the commit message clear and concise, following these guidelines:\n
    - Start with a brief summary describing the purpose of the commit.\n
    - Provide additional details about the changes made and their context.\n
    - Indicate the scope of the changes, such as which files or components were modified.\n
    - If the commit is related to a specific issue or task, include a reference to it.\n
    Example commit message:\n
    "feat: Add user authentication functionality\n\n
    - Implement user login and registration forms\n
    - Integrate authentication middleware for protected routes\n
    - Update user model with password hashing for security\n
    " \n
    if you are not sure what to write , just update changes from jutsu-git\n
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(" ");
  console.log(chalk.bgBlack.white.bold("AI Generated Commit Message:"));
  console.log(" ");
  console.log(chalk.white(text));
  console.log(" ");
  return text;
}

export default getCommitMessage;
