// import Subscriber from '../models/Subscriber.js';

// /**
//  * SUBSCRIBE TO NEWSLETTER
//  */
// export const subscribe = async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Email is required'
//             });
//         }

//         // Check if already subscribed
//         const existing = await Subscriber.findOne({ email });
//         if (existing) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'You are already subscribed!'
//             });
//         }

//         const subscriber = new Subscriber({ email });
//         await subscriber.save();

//         res.json({
//             success: true,
//             message: 'Subscribed successfully!'
//         });
//     } catch (error) {
//         console.error('Subscription error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal Server Error'
//         });
//     }
// };

// /**
//  * GET ALL SUBSCRIBERS (For Admin)
//  */
// export const getSubscribers = async (req, res) => {
//     try {
//         const subscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });
//         res.json(subscribers);
//     } catch (error) {
//         console.error('Error fetching subscribers:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal Server Error'
//         });
//     }
// };

// /**
//  * SEND MESSAGE TO ALL SUBSCRIBERS
//  */
// import { sendMail } from '../services/mail.service.js';

// export const sendMessageToAllSubscribers = async (req, res) => {
//     try {
//         const { subject, message } = req.body;

//         if (!subject || !message) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Subject and Message are required'
//             });
//         }

//         const subscribers = await Subscriber.find({});

//         if (subscribers.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No subscribers found'
//             });
//         }

//         // Send emails
//         const emailPromises = subscribers.map(sub =>
//             sendMail({
//                 to: sub.email,
//                 subject: subject,
//                 html: `
//                     <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
//                         <h2 style="color: #333;">${subject}</h2>
//                         <div style="line-height: 1.6; color: #555;">
//                             ${message.replace(/\n/g, '<br>')}
//                         </div>
//                         <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
//                         <p style="font-size: 12px; color: #999;">You received this because you're subscribed to our newsletter.</p>
//                     </div>
//                 `
//             })
//         );

//         await Promise.all(emailPromises);

//         res.json({
//             success: true,
//             message: `Message sent to ${subscribers.length} subscribers successfully!`
//         });
//     } catch (error) {
//         console.error('Error sending message to subscribers:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal Server Error'
//         });
//     }
// };

import Subscriber from '../models/Subscriber.js';
import { sendMail } from '../services/mail.service.js';

/* ==============================
   SUBSCRIBE USER
============================== */

export const subscribe = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const existing = await Subscriber.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already subscribed!'
      });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send welcome email
    try {
      await sendMail({
        to: email,
        subject: "Welcome to Colossus IQ",
      html: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif;">
  <tr>
    <td align="left" style="padding:20px;">

      <table width="600" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left">

            <h2 style="margin-bottom:10px;">Welcome to Colossus IQ!</h2>

            <p>Thank you for subscribing to our newsletter.</p>

            <p>You’ll now receive updates about new courses, learning resources, and platform announcements.</p>

            <p style="margin:20px 0;">
              <a href="http://colossusiq.ai/" 
                 target="_blank"
                 style="background:#4f46e5;
                        color:#ffffff;
                        padding:10px 18px;
                        text-decoration:none;
                        border-radius:6px;
                        display:inline-block;
                        font-weight:600;">
                Visit Colossus IQ
              </a>
            </p>

            <p style="color:#555; margin-top:25px;">
              Best regards,<br/>
              Colossus IQ Team
            </p>

          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
`
      });
    } catch (mailError) {
      console.error("Welcome email failed:", mailError);
    }

    res.json({
      success: true,
      message: 'Subscribed successfully!'
    });

  } catch (error) {

    console.error('Subscription error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });

  }
};


/* ==============================
   GET ALL SUBSCRIBERS (ADMIN)
============================== */

export const getSubscribers = async (req, res) => {
  try {

    const subscribers = await Subscriber.find({})
      .sort({ subscribedAt: -1 });

    res.json(subscribers);

  } catch (error) {

    console.error("Error fetching subscribers:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
};


/* ==============================
   SEND MESSAGE TO ALL
============================== */

export const sendMessageToAllSubscribers = async (req, res) => {
  try {

    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required"
      });
    }

    const subscribers = await Subscriber.find({});

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No subscribers found"
      });
    }

    const emailPromises = subscribers.map(sub =>
      sendMail({
        to: sub.email,
        subject,
       html: `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">
  ${message.replace(/\n/g, "<br>")}
</div>
`
      })
    );

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `Message sent to ${subscribers.length} subscribers`
    });

  } catch (error) {

    console.error("Email sending error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
};