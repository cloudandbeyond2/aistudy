import mongoose from "mongoose";

const globalNewsSchema = new mongoose.Schema({
  title: String,
  content: String,

  image: String,

  redirectUrl: String,   // VERY IMPORTANT

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("GlobalNews", globalNewsSchema);