// // import mongoose from 'mongoose';

// // const userSchema = new mongoose.Schema({
// //   email: { type: String, unique: true, required: true },
// //   mName: String,
// //   password: String,
// //   type: String,
// //   resetPasswordToken: { type: String, default: null },
// //   resetPasswordExpires: { type: Date, default: null },
// //   date: { type: Date, default: Date.now }
// // });

// // export default mongoose.model('User', userSchema);

// // models/user.model.js

// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   email: { type: String, unique: true, required: true },
//   mName: String,
//   password: String,
//   type: String, // free | monthly | yearly | forever
//   subscriptionStart: { type: Date, default: null },
//   subscriptionEnd: { type: Date, default: null },
//   resetPasswordToken: { type: String, default: null },
//   resetPasswordExpires: { type: Date, default: null },
//   isEmailVerified: { type: Boolean, default: false },
//   emailVerificationToken: { type: String, default: null },
//   emailVerificationExpires: { type: Date, default: null },
//   date: { type: Date, default: Date.now },
//   userType: {
//     type: String,
//     enum: ["individual", "organization"],
//     default: null
//   },
 
//   // Individual fields
//   profession: {
//     type: String,
//     default: ""
//   },
//   experienceLevel: {
//     type: String,
//     enum: ["beginner", "intermediate", "advanced"],
//     default: "beginner"
//   },
 
//   // Organization fields
//   organizationName: {
//     type: String,
//     default: ""
//   },
// });

// export default mongoose.model('User', userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // AUTH
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },

    // PROFILE BASIC
    name: { type: String, default: "" },          // Full Name
    phone: { type: String, default: "" },
    dob: { type: Date, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },

    // LOCATION
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    pin: { type: String, default: "" },
    address: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    // USER TYPE
    userType: {
      type: String,
      enum: ["individual", "organization"],
      default: null,
    },

    // INDIVIDUAL FIELDS
    profession: { type: String, default: "" },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    // ORGANIZATION FIELDS
    organizationName: { type: String, default: "" },

    // SUBSCRIPTION
    type: {
      type: String,
      enum: ["free", "monthly", "yearly", "forever"],
      default: "free",
    },
    subscriptionStart: { type: Date, default: null },
    subscriptionEnd: { type: Date, default: null },

    // PASSWORD RESET
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // EMAIL VERIFY
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
