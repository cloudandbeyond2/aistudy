console.log("Script execution started...");
const path = require('path');
// Try loading .env from different possible locations
require('dotenv').config({ path: path.resolve(__dirname, 'server/.env') }); // If running from root
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // If running from server dir

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    console.log("Testing Gemini API connection...");
    console.log("Current working directory:", process.cwd());

    if (!process.env.API_KEY) {
        console.error("❌ Error: API_KEY is missing from process.env");
        console.log("Have you created the .env file?");
        return;
    } else {
        console.log("API_KEY found (length: " + process.env.API_KEY.length + ")");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Explain AI in one sentence.";
        console.log(`Sending prompt: "${prompt}"`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Success! Gemini response:");
        console.log(text);

    } catch (error) {
        console.error("❌ Gemini API Failed:");
        console.error(error);
        if (error.message && error.message.includes("429")) {
            console.error("👉 CAUSE: Quota Exceeded (You ran out of free usage)");
        } else if (error.message && error.message.includes("API key")) {
            console.error("👉 CAUSE: Invalid API Key");
        }
    }
}

testGemini();
