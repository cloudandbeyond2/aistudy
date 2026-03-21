/**
 * Migration script: Update admin geminiModel from gemini-2.5-flash to gemini-1.5-flash
 * Run once: node scripts/fix-admin-model.js
 */
import '../config/env.js';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';

await connectDB();

const result = await Admin.updateMany(
  { geminiModel: 'gemini-2.5-flash' },
  { $set: { geminiModel: 'gemini-1.5-flash' } }
);

console.log(`Updated ${result.modifiedCount} admin document(s).`);
process.exit(0);
