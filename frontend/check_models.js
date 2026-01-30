import axios from 'axios';
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

const envPath = path.resolve(__dirname, 'server/.env');
dotenv.config({ path: envPath });

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    log('API_KEY not found');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

log('Fetching models from: ' + url);

axios.get(url)
    .then(response => {
        log('Models found:');
        const models = response.data.models;
        if (models) {
            models.forEach(m => {
                log(`- ${m.name} (${m.displayName})`);
                if (m.supportedGenerationMethods) {
                    log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            log('No models returned in response data.');
        }
    })
    .catch(error => {
        log('Error fetching models:');
        if (error.response) {
            log(`Status: ${error.response.status}`);
            log(JSON.stringify(error.response.data, null, 2));
        } else {
            log(error.message);
        }
    });
