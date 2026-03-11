
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
        model: 'gemini-2.5-flash',
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

async function testBatchContent() {
    console.log("\n--- Testing Batch Content Generation ---");
    const systemInstruction = `Strictly in English, you are a specialized educational content writer. 
Your goal is to provide thorough, in-depth, and "large" explanations for course subtopics.
For each subtopic, provide a detailed explanation (approx 500-1000 words if possible) with rich examples and clear definitions.
Use valid HTML formatting for the "theory" field (paragraphs, bold text, lists).
Do NOT include images, external links, or additional resource suggestions.
ONLY respond with a valid JSON object.`;

    const prompt = `Course: "Quantum Mechanics"
Chapter: "Fundamentals"

Generate comprehensive educational content for these subtopics:
1. Wave-Particle Duality
2. Heisenberg Uncertainty Principle

Response Format (JSON):
{
  "subtopics": [
    { "title": "Subtopic Title", "theory": "Detailed HTML Content" }
  ]
}`;

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction,
        generationConfig: {
            responseMimeType: 'application/json'
        }
    });

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    console.log("Response Length:", text.length, "chars");
    // console.log("Response Snippet:", text.substring(0, 500) + "...");
    try {
        const parsed = JSON.parse(text);
        console.log("✅ JSON is valid");
        if (parsed.subtopics[0].theory.length > 500) {
            console.log("✅ Content is large (" + parsed.subtopics[0].theory.length + " chars for first subtopic)");
        } else {
            console.warn("⚠️ Content might be shorter than expected (" + parsed.subtopics[0].theory.length + " chars)");
        }
    } catch (e) {
        console.error("❌ JSON is invalid");
    }
}

async function runTests() {
    try {
        await testOutline();
        await testBatchContent();
    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTests();
