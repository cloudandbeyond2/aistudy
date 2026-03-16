import dotenv from 'dotenv';
import { createApi } from 'unsplash-js';
import fetch from 'node-fetch';

dotenv.config();

// Polyfill fetch for unsplash-js
if (!global.fetch) {
  global.fetch = fetch;
}

const accessKey = process.env.UNSPLASH_ACCESS_KEY;
console.log("Unsplash Key:", accessKey ? "Set" : "Not Set");

const unsplash = createApi({ accessKey });

async function testImage() {
  const prompt = "Introduction to Jenkins: History and Core Concepts in Jenkins";
  console.log("Testing prompt:", prompt);
  
  const cleanedPrompt = prompt.replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 80);
  console.log("Cleaned prompt:", cleanedPrompt);
  
  try {
    console.log("Calling Unsplash...");
    const result = await unsplash.search.getPhotos({
      query: cleanedPrompt,
      perPage: 3,
      orientation: 'landscape',
      contentFilter: 'high',
    });
    
    if (result.errors) {
      console.error("Unsplash error:", result.errors[0]);
    } else if (result.response) {
      console.log("Unsplash response total:", result.response.total);
      if (result.response.results.length > 0) {
        console.log("SUCCESS! URL:", result.response.results[0].urls.regular);
      } else {
        console.log("No results from Unsplash for this prompt.");
      }
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

testImage();
