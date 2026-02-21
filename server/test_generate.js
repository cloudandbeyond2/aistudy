const testGenerate = async () => {
    try {
        console.log("Calling /api/generate...");
        const res = await fetch("http://localhost:5001/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "Explain testing in software" })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);

        console.log("\nCalling /api/prompt...");
        const res2 = await fetch("http://localhost:5001/api/prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "Generate 3 topics for testing course" })
        });
        const data2 = await res2.json();
        console.log("Status:", res2.status);
        console.log("Response:", data2);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testGenerate();
