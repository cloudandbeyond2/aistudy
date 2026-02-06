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
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import crypto from 'crypto';
import transporter from '../config/mail.js';
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
          message: 'User with this email already exists'
        });
      }

      // 3. Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

      const newUser = new User({
        email,
        mName,
        password,
        type,
        phone,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false
      });
      await newUser.save();

      // 4. Send verification email
      try {
        const baseUrl = process.env.WEBSITE_URL.endsWith('/')
          ? process.env.WEBSITE_URL.slice(0, -1)
          : process.env.WEBSITE_URL;
        const verificationLink = `${baseUrl}/verify-email/${verificationToken}`;
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: email,
          subject: `Verify your email for ${process.env.COMPANY || 'AIstudy'}`,
          html: `<p>Hello ${mName}, click <a href="${verificationLink}">here</a> to verify your email.</p>`
        });
      } catch (mailErr) {
        console.error('Mail Send Error:', mailErr);
        return res.json({
          success: true,
          message: 'Account created successfully, but verification email could not be sent.',
          userId: newUser._id,
          mailError: true
        });
      }

      return res.json({
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        userId: newUser._id,
        verificationRequired: true
      });
    } else {
      // First user becomes admin
      const newUser = new User({
        email,
        mName,
        password,
        type: 'forever',
        phone
      });
      await newUser.save();

      const newAdmin = new Admin({
        email,
        mName,
        type: 'main'
      });
      await newAdmin.save();

      return res.json({
        success: true,
        message: 'Account created successfully as Admin',
        userId: newUser._id,
        autoLogin: true
      });
    }
  } catch (error) {
    console.error('Signup Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
        message: 'Invalid email or password'
      });
    }

    if (password === user.password) {
      // Check if email is verified
      if (user.isEmailVerified === false && user.emailVerificationToken) {
        return res.json({
          success: false,
          message: 'Please verify your email before logging in. Check your inbox for the verification link.'
        });
      }

      return res.json({
        success: true,
        message: 'SignIn Successful',
        userData: user
      });
    }

    return res.json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    console.error('Signin Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Invalid email or password',
      error: error.message
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
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};
/**
 * SOCIAL LOGIN (Google / Facebook)
 */
export const socialLogin = async (req, res) => {
  const { email, name } = req.body;

  const mName = name;
  const password = ''; // Social login → no password
  const type = 'free';

  try {
    let user = await User.findOne({ email });

    // Existing user → login
    if (user) {
      return res.json({
        success: true,
        message: 'SignIn Successful',
        userData: user
      });
    }

    // First user logic (same as signup)
    const estimate = await User.estimatedDocumentCount();

    user = new User({
      email,
      mName,
      password,
      type: estimate === 0 ? 'forever' : 'free'
    });

    await user.save();

    // First user becomes admin
    if (estimate === 0) {
      const admin = new Admin({
        email,
        mName,
        type: 'main'
      });
      await admin.save();
    }

    res.json({
      success: true,
      message: 'Account created successfully',
      userData: user
    });
  } catch (error) {
    console.error('Social Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
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
      return res.json({ success: false, message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');

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
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.log('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
      email: user.email
    });
  } catch (error) {
    console.log('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * UPDATE USER PROFILE
 */
export const updateProfile = async (req, res) => {
  const { email, mName, password, uid } = req.body;

  if (!uid || !email || !mName) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    const updateData = {
      email,
      mName
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.log('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
