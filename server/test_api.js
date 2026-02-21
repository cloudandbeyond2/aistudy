const testAPI = async () => {
    try {
        console.log("Testing POST /api/generate without valid API Key...");
        const res = await fetch("http://localhost:5001/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: "Explain AI in 1 sentence" })
        });
        const data = await res.json();
        console.log("Status Code:", res.status);
        console.log("Response:", data);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testAPI();
