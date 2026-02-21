import { GoogleGenerativeAI } from '@google/generative-ai';

const runTest = async () => {
    try {
        const key = "AIzaSyBgkqIWIl6mGLMOJ8fZ4Kuf2Ga3BLkJr1g";
        console.log("Using Key Length:", key.length);

        const genAI = new GoogleGenerativeAI(key);
        const modelsToTest = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

        for (const modelName of modelsToTest) {
            console.log(`Testing model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say 'hello world'");
                console.log(`Success with ${modelName}:`, result.response.text());
                process.exit(0); // exit on first success
            } catch (err) {
                console.error(`Failed with ${modelName}:`, err.message);
            }
        }

        console.log("All models failed.");
        process.exit(1);
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}
runTest();
