import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.resolve(__dirname, 'debug_output.txt');

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

// Clear log file
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

log('Starting debug script...');

try {
    const envPath = path.resolve(__dirname, 'server/.env');
    log(`Loading env from: ${envPath}`);

    if (fs.existsSync(envPath)) {
        log('Env file exists.');
    } else {
        log('Env file DOES NOT EXIST.');
    }

    const result = dotenv.config({ path: envPath });
    if (result.error) {
        log('Dotenv error: ' + result.error.message);
    }

    const apiKey = process.env.API_KEY;
    if (apiKey) {
        log(`API_KEY found (length: ${apiKey.length})`);
        log(`API_KEY starts with: ${apiKey.substring(0, 5)}...`);
    } else {
        log('API_KEY is MISSING or undefined in process.env');
    }

    log('Initializing GoogleGenerativeAI...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Use gemini-flash-latest

    log('Sending prompt...');
    model.generateContent("Hello").then((res) => {
        log('Response received!');
        log(res.response.text());
    }).catch(err => {
        log('Generate content error: ' + err.message);
        if (err.response) {
            log('Response status: ' + err.response.status);
            // log(JSON.stringify(err.response, null, 2));
        }
    });

} catch (e) {
    log('CRITICAL EXCEPTION: ' + e.message);
    log(e.stack);
}
