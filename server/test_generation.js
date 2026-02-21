import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const testGenerateHtml = async () => {
    try {
        const key = process.env.API_KEY;
        const genAI = new GoogleGenerativeAI(key);

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            }
        ];

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            safetySettings
        });

        const prompt = "Explain AI";
        const result = await model.generateContent(prompt);
        console.log("Success! Result text:", await result.response.text());
    } catch (e) {
        console.error("Error from Gemini API:", e.message);
        console.error("Stack trace:", e.stack);
    }
}

testGenerateHtml();
