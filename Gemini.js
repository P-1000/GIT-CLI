import { GoogleGenerativeAI } from "@google/generative-ai";
import chalk from "chalk";
import fs from "fs";
import { homedir } from "os";
import inquirer from "inquirer";

const API_KEY_FILE_PATH = `${homedir()}/.jutsu-git-apikey`;

const getApiKey = async () => {
  let apiKey;
  try {
    if (fs.existsSync(API_KEY_FILE_PATH)) {
      apiKey = fs.readFileSync(API_KEY_FILE_PATH, "utf-8").trim();
    }
    if (!apiKey) {
      const { apiKey: enteredApiKey } = await inquirer.prompt([
        {
          type: "input",
          name: "apiKey",
          message: "Enter your API key:",
          validate: function (value) {
            return value.trim().length !== 0 || "API key cannot be empty";
          },
        },
      ]);
      apiKey = enteredApiKey.trim();
      fs.writeFileSync(API_KEY_FILE_PATH, apiKey);
      console.log(chalk.green("API key saved successfully."));
    }
    return apiKey;
  } catch (error) {
    console.error(
      chalk.red(`Error retrieving or saving API key: ${error.message}`)
    );
    process.exit(1);
  }
};

const apiKey = await getApiKey();

const genAI = new GoogleGenerativeAI(apiKey);

async function getCommitMessage(diffinput) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
🌟 **Commit Message Architect** 🌟

📝 **Objective**: Craft a precise, well-structured Git commit message for the provided code changes.

🔍 **Input Data**:
\`\`\`
${diffinput}
\`\`\`

✅ **Guidelines**:
1. **Atomic Structure**:
   - Subject Line (<=72 chars): [Optional Emoji] Imperative verb + concise summary
   - Body: Technical context, rationale, and affected components
   - Footer: [Optional] Related issues/PRs (only if explicitly mentioned in diff)

2. **Content Requirements**:
   • Focus on *what changed* not just *why*
   • Highlight specific file/component impacts
   • Mention added/removed/modified behavior
   • Quantify when possible (e.g., "3x performance boost")

3. **Style Rules**:
   → Use present tense imperative ("Fix bug" not "Fixed bug")
   → Avoid jargon unless domain-specific
   → No issue tracker references unless present in diff
   → Markdown-free plain text

🚫 **Constraints**:
- STRICTLY avoid assumptions beyond diff content
- Never include documentation links
- No empty praise ("Awesome change!")
- No technical debt commentary

📋 **Example**:
\`\`\`
perf(rendering): optimize texture compression pipeline

• Implement GPU-accelerated BC7 encoding in TextureProcessor.cpp
• Reduce VRAM usage by 40% in material loading system
• Update Vulkan backend to support new compression flags
\`\`\`

🆘 **Fallback Protocol**:
If changes are unclear/ambiguous, output:
"chore: update changes"

⚡ **Tone**: Professional yet approachable - imagine explaining to a senior engineer over coffee

🔬 **Validation**: Perform self-check:
1. Does subject line clearly state WHAT and SCOPE?
2. Does body explain DETAILS without redundancy?
3. Could this message auto-generate useful release notes?
4. Is it minimal but complete?

📤 **Output**: Ready for 'git commit' - no markdown, just clean text
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
    console.error(
      chalk.red(`Error generating commit message: ${error.message}`)
    );
    return null;
  }
}

export default getCommitMessage;
