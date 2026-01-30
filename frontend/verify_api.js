import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

const API_KEY = process.env.API_KEY;

console.log('----------------------------------------');
console.log('Testing Google AI API Connectivity');
console.log('API Key:', API_KEY);
console.log('----------------------------------------');

const genAI = new GoogleGenerativeAI(API_KEY);

async function testAPI() {
    try {
        // Explicitly using gemini-pro as configured in server.js
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "Reply with 'API_WORKING_CONFIRMED'";

        console.log('Sending test prompt to Google AI...');
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log('\n✅ SUCCESS! The API is enabled and working.');
        console.log('Response:', text);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ FAILURE! The API is still not working.');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);

        if (error.message.includes('API key not valid')) {
            console.error('-> CAUSE: The API key is incorrect.');
        } else if (error.message.includes('User has not enabled the Gemini API')) {
            console.error('-> CAUSE: The API is NOT enabled in your Google Cloud Console.');
        } else if (error.status === 500) {
            console.error('-> CAUSE: Internal Server Error (often means API not enabled or billing issue).');
        }
        process.exit(1);
    }
}

testAPI();
