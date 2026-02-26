// import User from '../models/User.js';
// import Admin from '../models/Admin.js';
// import crypto from 'crypto';
// import transporter from '../config/mail.js';
// import axios from 'axios';
// /**
//  * SIGNUP
//  */
// export const signup = async (req, res) => {
//   const { email, mName, password, type, captchaToken } = req.body;

//   try {
//     // 1. Verify reCAPTCHA
//     if (!captchaToken) {
//       return res.json({
//         success: false,
//         message: 'Please complete the reCAPTCHA verification.'
//       });
//     }

//     try {
//       const response = await axios.post(
//         'https://www.google.com/recaptcha/api/siteverify',
//         null,
//         {
//           params: {
//             secret: process.env.RECAPTCHA_SECRET_KEY,
//             response: captchaToken
//           }
//         }
//       );

//       console.log('reCAPTCHA Verification Response:', response.data);

//       if (!response.data.success) {
//         return res.json({
//           success: false,
//           message: 'reCAPTCHA verification failed. Please try again.',
//           error: response.data['error-codes']?.join(', ') || 'Unknown reCAPTCHA error'
//         });
//       }
//     } catch (captchaErr) {
//       console.error('reCAPTCHA Service Error:', captchaErr.message);
//       return res.json({
//         success: false,
//         message: 'Error communicating with reCAPTCHA service.'
//       });
//     }

//     // 2. Check existing users
//     const estimate = await User.estimatedDocumentCount();

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     // 3. Generate verification token
//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

//     let newUser;

//     if (estimate > 0) {
//       newUser = new User({
//         email,
//         mName,
//         password,
//         type,
//         emailVerificationToken: verificationToken,
//         emailVerificationExpires: verificationExpires,
//         isEmailVerified: false
//       });

//       await newUser.save();
//     } else {
//       // First user → admin
//       newUser = new User({
//         email,
//         mName,
//         password,
//         type: 'forever',
//         isEmailVerified: true
//       });

//       await newUser.save();

//       await new Admin({
//         email,
//         mName,
//         type: 'main'
//       }).save();

//       return res.json({
//         success: true,
//         message: 'Account created successfully as Admin',
//         userId: newUser._id,
//         autoLogin: true
//       });
//     }

//     // 4. Send verification email
//     const verificationLink = `${process.env.WEBSITE_URL}/verify-email/${verificationToken}`;

//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: email,
//       subject: `Verify your email for ${process.env.COMPANY || 'AIstudy'}`,
//       html: `<p>Hello ${mName}, click <a href="${verificationLink}">here</a> to verify your email.</p>`
//     });

//     return res.json({
//       success: true,
//       message: 'Account created! Please check your email to verify your account.',
//       userId: newUser._id,
//       verificationRequired: true
//     });

//   } catch (error) {
//     console.error('Signup Error:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// /**
//  * SIGNIN
//  */
// export const signin = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     if (password === user.password) {
//       // Check if email is verified
//       // We only enforce this for users who HAVE a verification token (newly created users)
//       // Legacy users who don't have a token yet will be allowed to log in
//       if (user.isEmailVerified === false && user.emailVerificationToken) {
//         return res.json({
//           success: false,
//           message: 'Please verify your email before logging in. Check your inbox for the verification link.'
//         });
//       }

//       return res.json({
//         success: true,
//         message: 'SignIn Successful',
//         userData: user
//       });
//     }

//     return res.json({
//       success: false,
//       message: 'Invalid email or password'
//     });

//   } catch (error) {
//     console.error('Signin Error Details:', error);

//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// /**
//  * VERIFY EMAIL
//  */
// export const verifyEmail = async (req, res) => {
//   const { token } = req.params;

//   try {
//     const user = await User.findOne({
//       emailVerificationToken: token,
//       emailVerificationExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or expired verification token.'
//       });
//     }

//     user.isEmailVerified = true;
//     user.emailVerificationToken = null;
//     user.emailVerificationExpires = null;
//     await user.save();

//     res.json({
//       success: true,
//       message: 'Email verified successfully! You can now log in.'
//     });
//   } catch (error) {
//     console.error('Email Verification Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };
// /**
//  * SOCIAL LOGIN (Google / Facebook)
//  */
// export const socialLogin = async (req, res) => {
//   const { email, mName } = req.body;

//   // const mName = mName;
//   const password = ''; // Social login → no password
//   const type = 'free';

//   try {
//     let user = await User.findOne({ email });

//     // Existing user → login
//     if (user) {
//       return res.json({
//         success: true,
//         message: 'SignIn Successful',
//         userData: user
//       });
//     }

//     // First user logic (same as signup)
//     const estimate = await User.estimatedDocumentCount();

//     user = new User({
//       email,
//       mName,
//       password,
//       type: estimate === 0 ? 'forever' : 'free'
//     });

//     await user.save();

//     // First user becomes admin
//     if (estimate === 0) {
//       const admin = new Admin({
//         email,
//         mName,
//         type: 'main'
//       });
//       await admin.save();
//     }

//     res.json({
//       success: true,
//       message: 'Account created successfully',
//       userData: user
//     });
//   } catch (error) {
//     console.error('Social Login Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };

// /**
//  * FORGOT PASSWORD
//  */
// export const forgotPassword = async (req, res) => {
//   const { email, mName, company, logo } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.json({ success: false, message: 'User not found' });
//     }

//     const token = crypto.randomBytes(20).toString('hex');

//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
//     await user.save();

//     const resetLink = `${process.env.WEBSITE_URL}/reset-password/${token}`;

//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: user.email,
//       subject: `${mName} Password Reset`,
//       html: `
//         <h2>Password Reset</h2>
//         <p>Click the button below to reset the password for ${email}</p>
//         <a href="${resetLink}" target="_blank"
//            style="padding:10px 16px;background:#007BFF;color:#fff;border-radius:4px;text-decoration:none">
//            Reset Password
//         </a>
//         <p><strong>${company}</strong></p>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({
//       success: true,
//       message: 'Password reset link sent to your email'
//     });
//   } catch (error) {
//     console.log('Forgot password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// /**
//  * RESET PASSWORD
//  */
// export const resetPassword = async (req, res) => {
//   const { password, token } = req.body;

//   try {
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.json({
//         success: false,
//         message: 'Invalid or expired token'
//       });
//     }

//     user.password = password;
//     user.resetPasswordToken = null;
//     user.resetPasswordExpires = null;

//     await user.save();

//     res.json({
//       success: true,
//       message: 'Password updated successfully',
//       email: user.email
//     });
//   } catch (error) {
//     console.log('Reset password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// /**
//  * UPDATE USER PROFILE
//  */
// // export const updateProfile = async (req, res) => {
// //   const { email, mName, password, uid } = req.body;

// //   if (!uid || !email || !mName) {
// //     return res.status(400).json({
// //       success: false,
// //       message: 'Missing required fields'
// //     });
// //   }

// //   try {
// //     const updateData = {
// //       email,
// //       mName
// //     };

// //     // Only update password if provided
// //     if (password && password.trim() !== '') {
// //       updateData.password = password;
// //     }

// //     const updatedUser = await User.findByIdAndUpdate(
// //       uid,
// //       { $set: updateData },
// //       { new: true }
// //     );

// //     if (!updatedUser) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'User not found'
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       message: 'Profile updated successfully',
// //       user: updatedUser
// //     });
// //   } catch (error) {
// //     console.log('Profile update error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Internal server error'
// //     });
// //   }
// // };
// // GET profile

// export const updateProfile = async (req, res) => {
//   const {
//     uid,
//     email,
//     name,
//     password,

//     phone,
//     dob,
//     gender,

//     country,
//     city,
//     pin,
//     address,

//     userType,
//     profession,
//     experienceLevel,
//     organizationName
//   } = req.body;

//   if (!uid || !email || !name) {
//     return res.status(400).json({
//       success: false,
//       message: 'Missing required fields'
//     });
//   }

//   try {
//     const updateData = {
//       email,
//       name,
//       phone,
//       dob,
//       gender,
//       country,
//       city,
//       pin,
//       address,
//       userType,
//       profession,
//       experienceLevel,
//       organizationName
//     };

//     // Only update password if user entered one
//     if (password && password.trim() !== "") {
//       updateData.password = password;
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       uid,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user: updatedUser
//     });
//   } catch (error) {
//     console.error('Profile update error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Organization from '../models/Organization.js';
import crypto from "crypto";
import transporter from "../config/mail.js";
import bcrypt from "bcrypt";
/**
 * SIGNUP
 */
export const signup = async (req, res) => {
  const { email, mName, password, type, phone } = req.body;

  try {
    const estimate = await User.estimatedDocumentCount();

    if (estimate > 0) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // 3. Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

      const hashedPassword = await bcrypt.hash(password, 10);
      const freePlanStart = new Date();
      const freePlanEnd = new Date(freePlanStart.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const newUser = new User({
        email,
        mName,
        password: hashedPassword,
        type,
        phone,
        subscriptionStart: freePlanStart,
        subscriptionEnd: freePlanEnd,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false,
      });
      await newUser.save();

      // 4. Send verification email
      try {
        const baseUrl = process.env.WEBSITE_URL.endsWith("/")
          ? process.env.WEBSITE_URL.slice(0, -1)
          : process.env.WEBSITE_URL;
        const verificationLink = `${baseUrl}/verify-email/${verificationToken}`;
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: email,
          subject: `Verify your email for ${process.env.COMPANY || "AIstudy"}`,
          html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<!-- MAIN CARD -->
<table width="700" cellpadding="0" cellspacing="0"
style="background:#e9e9e9;border-radius:10px;border:1px solid #d0d0d0;">

<tr>
<td style="padding:35px 40px; color:#333;">

<!-- TITLE -->
<h2 style="text-align:center;margin-top:0;margin-bottom:25px;color:#333;">
Email Verification
</h2>

<!-- CONTENT -->
<p>Hello <strong>${mName}</strong>,</p>

<p>
Thank you for signing up for <strong>${process.env.COMPANY || "Traininglabs Ai Solutions"}</strong>.
Please click the button below to verify your email address and activate your account.
</p>

<!-- BUTTON -->
<div style="text-align:center;margin:35px 0;">
<a href="${verificationLink}"
style="
background:#1a73e8;
color:#ffffff;
text-decoration:none;
padding:12px 26px;
border-radius:6px;
font-weight:bold;
display:inline-block;
font-size:15px;">
Verify Email Address
</a>
</div>

<p>This link will expire in 24 hours.</p>

<p>If you did not create an account, no further action is required.</p>

<hr style="border:none;border-top:1px solid #cfcfcf;margin:30px 0;">

<!-- FOOTER -->
<p style="text-align:center;font-size:12px;color:#666;margin-bottom:0;">
© ${new Date().getFullYear()} ${process.env.COMPANY || "Traininglabs Ai Solutions"}. All rights reserved.
</p>

</td>
</tr>
</table>
<!-- END CARD -->

</td>
</tr>
</table>

</body>
</html>
`,
        });
      } catch (mailErr) {
        console.error("Mail Send Error:", mailErr);
        return res.json({
          success: true,
          message:
            "Account created successfully, but verification email could not be sent.",
          userId: newUser._id,
          mailError: true,
        });
      }

      return res.json({
        success: true,
        message:
          "Account created! Please check your email to verify your account.",
        userId: newUser._id,
        verificationRequired: true,
      });
    } else {
      // First user becomes admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        mName,
        password: hashedPassword,
        type: "forever",
        phone,
        isEmailVerified: true,
      });
      await newUser.save();

      const newAdmin = new Admin({
        email,
        mName,
        type: "main",
      });
      await newAdmin.save();

      return res.json({
        success: true,
        message: "Account created successfully as Admin",
        userId: newUser._id,
        autoLogin: true,
      });
    }
  } catch (error) {
    console.error("Signup Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * SIGNIN
 */
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const isPlainTextMatch = password === user.password;

    if (isMatch || isPlainTextMatch) {
      if (user.isBlocked) {
        return res.json({
          success: false,
          message: 'Your account has been blocked. Please contact support.'
        });
      }

      // Check if user is part of a blocked organization
      if (user.organization) {
        const org = await Organization.findById(user.organization);
        if (org && org.isBlocked) {
          return res.json({
            success: false,
            message: 'Your organization account is blocked. Please contact support.'
          });
        }
      }

      if (user.isEmailVerified === false && user.emailVerificationToken) {
        return res.json({
          success: false,
          message:
            "Please verify your email before logging in. Check your inbox for the verification link.",
        });
      }

      return res.json({
        success: true,
        message: "SignIn Successful",
        userData: user,
      });
    }

    return res.json({
      success: false,
      message: "Invalid email or password",
    });
  } catch (error) {
    console.error("Signin Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      success: false,
      message: "Invalid email or password",
      error: error.message,
    });
  }
};

/**
 * VERIFY EMAIL
 */
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
/**
 * SOCIAL LOGIN (Google / Facebook)
 */
export const socialLogin = async (req, res) => {
  const { email, name } = req.body;

  const mName = name;
  const password = ""; // Social login → no password
  const type = "free";

  try {
    let user = await User.findOne({ email });

    // Existing user → login
    if (user) {
      if (user.isBlocked) {
        return res.json({
          success: false,
          message: 'Your account has been blocked. Please contact support.'
        });
      }
      return res.json({
        success: true,
        message: "SignIn Successful",
        userData: user,
      });
    }

    // First user logic (same as signup)
    const estimate = await User.estimatedDocumentCount();

    const socialFreePlanStart = new Date();
    const socialFreePlanEnd = new Date(socialFreePlanStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    user = new User({
      email,
      mName,
      password,
      type: estimate === 0 ? "forever" : "free",
      subscriptionStart: estimate === 0 ? null : socialFreePlanStart,
      subscriptionEnd: estimate === 0 ? null : socialFreePlanEnd,
    });

    await user.save();

    // First user becomes admin
    if (estimate === 0) {
      const admin = new Admin({
        email,
        mName,
        type: "main",
      });
      await admin.save();
    }

    res.json({
      success: true,
      message: "Account created successfully",
      userData: user,
    });
  } catch (error) {
    console.error("Social Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (req, res) => {
  const { email, name, company, logo } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetLink = `${process.env.WEBSITE_URL}/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: `${name} Password Reset`,
      html: `
        <h2>Password Reset</h2>
        <p>Click the button below to reset the password for ${email}</p>
        <a href="${resetLink}" target="_blank"
           style="padding:10px 16px;background:#007BFF;color:#fff;border-radius:4px;text-decoration:none">
           Reset Password
        </a>
        <p><strong>${company}</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  const { password, token } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
      email: user.email,
    });
  } catch (error) {
    console.log("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * UPDATE USER PROFILE
 */

// export const updateProfile = async (req, res) => {
//   const { email, mName, password, uid } = req.body;

//   if (!uid || !email || !mName) {
//     return res.status(400).json({
//       success: false,
//       message: 'Missing required fields'
//     });
//   }

//   try {
//     const updateData = {
//       email,
//       mName
//     };

//     // Only update password if provided
//     if (password && password.trim() !== '') {
//       updateData.password = await bcrypt.hash(password, 10);
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       uid,
//       { $set: updateData },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user: updatedUser
//     });
//   } catch (error) {
//     console.log('Profile update error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

export const updateProfile = async (req, res) => {
  const {
    uid,
    email,
    mName,
    password,

    phone,
    dob,
    gender,

    country,
    state,
    city,
    pin,
    address,

    userType,
    profession,
    experienceLevel,
    organizationName,
  } = req.body;

  if (!uid || !email || !mName) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    const updateData = {
      email,
      mName,
      phone,
      dob,
      gender,
      country,
      state,
      city,
      pin,
      address,
      userType,
      profession,
      experienceLevel,
      organizationName,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      { $set: updateData },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
