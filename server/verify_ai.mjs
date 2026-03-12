
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const key = process.env.API_KEY;
if (!key) {
    console.error("No API_KEY found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(key);

async function testOutline() {
    console.log("--- Testing Course Outline Generation ---");
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: "You are an expert educational course architect. Your goal is to design highly structured, coherent, and comprehensive course outlines. Always respond in valid JSON format. Provide EXACTLY the number of topics requested. Ensure subtopics are logical and detailed.",
        generationConfig: {
            responseMimeType: 'application/json'
        }
    });

    const prompt = `Course: "Quantum Mechanics"
    Language: English
    Chapters: 5
    Required Subtopics: Schrödinger equation, wave-particle duality

    Generate a detailed course structure in JSON with exactly 5 chapters.`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    console.log("Response:", text);
    try {
        JSON.parse(text);
        console.log("✅ JSON is valid");
    } catch (e) {
        console.error("❌ JSON is invalid");
    }
}

async function testBulkContent() {
    console.log("\n--- Testing Bulk Multi-Topic Content Generation ---");
    const systemInstruction = `Strictly in English, you are a specialized educational content writer. 
Your goal is to provide thorough, in-depth, and "large" explanations for course subtopics.
For each subtopic, provide a detailed explanation (approx 500-1000 words if possible) with rich examples and clear definitions.
Use valid HTML formatting for the "theory" field (paragraphs, bold text, lists).
Do NOT include images, external links, or additional resource suggestions.
ONLY respond with a valid JSON object matching the requested schema.`;

    const prompt = `Course: "Quantum Mechanics"

Generate comprehensive educational content for these chapters and subtopics:
Chapter 1: "Fundamentals"
Subtopics:
- Wave-Particle Duality
- Heisenberg Uncertainty Principle

Chapter 2: "Mathematical Formulation"
Subtopics:
- Schrödinger Equation
- Operators and Values

Response Format (JSON):
{
  "topics": [
    {
      "topicTitle": "Topic Title",
      "subtopics": [
        { "title": "Subtopic Title", "theory": "Detailed HTML Content" }
      ]
    }
  ]
}`;

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction,
        generationConfig: {
            responseMimeType: 'application/json'
        }
    });

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    console.log("Response Length:", text.length, "chars");
    try {
        const parsed = JSON.parse(text);
        console.log("✅ JSON is valid");
        console.log("Topics generated:", parsed.topics.length);
        parsed.topics.forEach(t => {
            console.log(`- ${t.topicTitle}: ${t.subtopics.length} subtopics`);
        });
        if (parsed.topics[0].subtopics[0].theory.length > 500) {
            console.log("✅ Content richness verified");
        }
    } catch (e) {
        console.error("❌ JSON is invalid");
        console.log("Raw response:", text);
    }
}

async function runTests() {
    try {
        await testOutline();
        await testBulkContent();
    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTests();
