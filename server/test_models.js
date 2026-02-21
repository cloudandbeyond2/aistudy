const runTest = async () => {
    try {
        const key = "AIzaSyBgkqIWIl6mGLMOJ8fZ4Kuf2Ga3BLkJr1g";
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

        console.log("Fetching accessible models...");
        const res = await fetch(url);
        const data = await res.json();

        if (data.models) {
            console.log("Accessible models count:", data.models.length);
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ') || 'unknown'})`));
        } else {
            console.log("Failed to fetch models:", data);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
runTest();
