// IMPORT
import path from "path";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import cors from "cors";
import compression from "compression";
import crypto from "crypto";
import dotenv from "dotenv";
import gis from "g-i-s";
import youtubesearchapi from "youtube-search-api";
import { YoutubeTranscript } from "youtube-transcript";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { createApi } from "unsplash-js";
import showdown from "showdown";
import axios from "axios";
import Stripe from "stripe";
import Flutterwave from "flutterwave-node-v3";
import { fileURLToPath } from "url";


//GENERATE EXAMS
// Duplicate endpoint removed - using the implementation at line 1085 instead

  // app.get('*', (req, res) => {
  //     res.sendFile(path.join(__dirname, '../dist/index.html'));
  // });

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
  });
}

//LISTEN
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
