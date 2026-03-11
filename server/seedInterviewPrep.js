
import mongoose from 'mongoose';
import InterviewCurrentAffair from './models/InterviewCurrentAffair.js';
import DailyAptitude from './models/DailyAptitude.js';
import './config/env.js';
import connectDB from './config/db.js';

const seedData = async () => {
  console.log("Starting seed process...");
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("DB connection attempt finished.");
    
    // Check if data already exists
    console.log("Checking InterviewCurrentAffair count...");
    const affairCount = await InterviewCurrentAffair.countDocuments();
    console.log("Current affairs count:", affairCount);
    if (affairCount === 0) {
      console.log("Inserting current affairs...");
      await InterviewCurrentAffair.create([
        {
          title: "India's Digital Transformation in 2024",
          content: "India has seen a massive surge in UPI transactions and digital infrastructure growth this year.",
          category: "Technology",
          isActive: true
        },
        {
          title: "New Space Mission Announced",
          content: "ISRO announces a new mission to explore the polar regions of the moon by 2026.",
          category: "Science",
          isActive: true
        },
        {
          title: "Global Economic Outlook",
          content: "The World Bank projects a steady growth for emerging economies in the next quarter.",
          category: "Economy",
          isActive: true
        }
      ]);
      console.log("Seed: Current Affairs added");
    }

    console.log("Checking DailyAptitude count...");
    const aptitudeCount = await DailyAptitude.countDocuments();
    console.log("Daily aptitude count:", aptitudeCount);
    if (aptitudeCount === 0) {
      console.log("Inserting daily aptitude...");
      await DailyAptitude.create([
        {
          title: "Daily Logical Reasoning - Level 1",
          description: "Basic logic and pattern matching for beginners.",
          isActive: true,
          questions: [
            {
              question: "If A=1, B=2, then C=?",
              options: ["3", "4", "5", "6"],
              answer: "3"
            },
            {
              question: "What comes next in the sequence: 2, 4, 8, 16, ?",
              options: ["20", "24", "32", "64"],
              answer: "32"
            }
          ]
        }
      ]);
      console.log("Seed: Daily Aptitude added");
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedData();
