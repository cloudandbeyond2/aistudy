const testSettings = async () => {
    try {
        console.log("Updating settings...");
        const res = await fetch("http://localhost:5001/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                geminiApiKey: "TEST_KEY_123",
                unsplashApiKey: "TEST_UNSPLASH",
                websiteName: "AIstudy",
                websiteLogo: "/logo.png",
                taxPercentage: 10
            })
        });
        const data = await res.json();
        console.log("Update Response:", data);

        console.log("Fetching settings...");
        const res2 = await fetch("http://localhost:5001/api/settings");
        const data2 = await res2.json();
        console.log("Fetch Response:", data2);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testSettings();
