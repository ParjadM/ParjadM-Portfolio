import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, 'server', '.env') });

const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const SERVER_SRC_DIR = path.join(ROOT_DIR, 'server', 'src');

const OUTPUT_FILE = path.join(PUBLIC_DIR, 'complexity.json');

// Get all JS/JSX files
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function analyzeProject() {
  console.log('Starting Project Complexity Analysis...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('Skipping complexity analysis (no API key).');
    const fallback = {
      timeWithConstant: "N/A",
      timeWithoutConstant: "N/A",
      memoryWithConstant: "N/A",
      memoryWithoutConstant: "N/A",
      explanation: "Skipped analysis during Vercel build."
    };
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fallback, null, 2));
    return;
  }

  const allFiles = [
    ...getAllFiles(SRC_DIR),
    ...getAllFiles(SERVER_SRC_DIR)
  ];

  let combinedCode = '';
  for (const file of allFiles) {
    // Basic filtering to avoid massive files (like large JSONs or minified stuff)
    const content = fs.readFileSync(file, 'utf-8');
    if (content.length < 100000) {
      combinedCode += `\n--- File: ${path.relative(ROOT_DIR, file)} ---\n`;
      combinedCode += content;
    }
  }

  console.log(`Bundled ${allFiles.length} files. Total length: ${combinedCode.length} chars`);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemInstruction = `You are an expert static analyzer for software architecture and code complexity.
I am providing you the entire source code of a modern React + Express web application.
Analyze the overarching Time and Space (Memory) Complexity of the application. Consider the heaviest common operations (e.g., rendering lists, API processing).
Provide the complexity BOTH with estimated constants (e.g., O(3N + 2)) and without constants (Big-O notation, e.g., O(N)).
Respond EXCLUSIVELY in valid JSON format using the following schema:
{
  "timeWithConstant": "...",
  "timeWithoutConstant": "...",
  "memoryWithConstant": "...",
  "memoryWithoutConstant": "...",
  "explanation": "A concise explanation of why the application has this complexity."
}`;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout after 60 seconds')), 60000)
    );

    const makeRequest = () => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: combinedCode }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    let apiPromise = makeRequest();
    let response;
    
    try {
      response = await Promise.race([apiPromise, timeoutPromise]);
    } catch (err) {
      if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota')) {
        console.log('Hit Gemini rate limit. Waiting 10 seconds and retrying...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        apiPromise = makeRequest();
        response = await Promise.race([apiPromise, timeoutPromise]);
      } else {
        throw err;
      }
    }

    const replyData = JSON.parse(response.text);
    
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(replyData, null, 2));
    
    console.log('Successfully generated complexity.json');
  } catch (err) {
    console.error('Failed to analyze complexity:', err.message);
    // Write fallback so the build doesn't crash completely
    const fallback = {
      timeWithConstant: "O(?)",
      timeWithoutConstant: "O(?)",
      memoryWithConstant: "O(?)",
      memoryWithoutConstant: "O(?)",
      explanation: "Failed to analyze during build step. " + err.message
    };
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fallback, null, 2));
  }
}

analyzeProject().then(() => process.exit(0));
