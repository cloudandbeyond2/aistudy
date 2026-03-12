
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

async function listModels() {
    try {
        const result = await genAI.listModels();
        console.log("Available Models:");
        result.models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
            console.log(`  Supported methods: ${m.supportedGenerationMethods.join(', ')}`);
        });
    } catch (error) {
        console.error("Failed to list models:", error);
    }
}

listModels();
