import { GoogleGenerativeAI } from "@google/generative-ai";
import chalk from "chalk";
import fs from 'fs';
import { homedir } from 'os';
import { execSync } from 'child_process';


const apiKey = execSync('npm config get myapi').toString().trim();

const API_KEY = apiKey
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
    if you are not sure what to write , just say this do not assume anything of yourself update changes from jutsu-git\n
    and do not go out of the scope of the changes\n

    do not write like refer to docs or something like that only write the changes that is it
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
