// Test the new /api/generate-batch endpoint
const runTest = async () => {
    try {
        const res = await fetch('http://localhost:5001/api/generate-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mainTopic: 'Python Programming',
                topicTitle: 'Variables and Data Types',
                subtopics: ['What is a variable?', 'Integer and Float types', 'String operations'],
                lang: 'English'
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        if (data.success) {
            console.log("Batch generation SUCCESS! Subtopics generated:", data.subtopics.length);
            data.subtopics.forEach(s => console.log(`  - ${s.title}: ${s.theory.substring(0, 80)}...`));
        } else {
            console.log("Error:", data.message);
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
}
runTest();
