import { GoogleGenerativeAI } from "@google/generative-ai";
import chalk from "chalk";
import fs from 'fs';
import { homedir } from 'os';
import inquirer from "inquirer";

const API_KEY_FILE_PATH = `${homedir()}/.jutsu-git-apikey`;

const getApiKey = async () => {
  let apiKey;
  try {
    if (fs.existsSync(API_KEY_FILE_PATH)) {
      apiKey = fs.readFileSync(API_KEY_FILE_PATH, 'utf-8').trim();
    }
    if (!apiKey) {
      const { apiKey: enteredApiKey } = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your API key:',
          validate: function(value) {
            return value.trim().length !== 0 || 'API key cannot be empty';
          }
        }
      ]);
      apiKey = enteredApiKey.trim();
      fs.writeFileSync(API_KEY_FILE_PATH, apiKey);
      console.log(chalk.green('API key saved successfully.'));
    }
    return apiKey;
  } catch (error) {
    console.error(chalk.red(`Error retrieving or saving API key: ${error.message}`));
    process.exit(1);
  }
};

const apiKey = await getApiKey();

const genAI = new GoogleGenerativeAI(apiKey);

async function getCommitMessage(diffinput) {
  try {
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
  } catch (error) {
    console.error(chalk.red(`Error generating commit message: ${error.message}`));
    return null; // Return null or handle the error as per your requirement
  }
}

export default getCommitMessage;
