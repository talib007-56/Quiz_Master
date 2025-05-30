const User = require('../models/user.model');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send Google Chat notification
const sendGoogleChatNotification = async (message) => {
  try {
    if (!process.env.GOOGLE_CHAT_WEBHOOK) {
      console.log('Google Chat webhook URL not configured');
      return;
    }

    const response = await fetch(process.env.GOOGLE_CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: message })
    });

    if (!response.ok) {
      throw new Error(`Failed to send Google Chat notification: ${response.statusText}`);
    }

    console.log('Google Chat notification sent');
  } catch (error) {
    console.error('Error sending Google Chat notification:', error);
  }
};

// Send daily reminders to inactive users
const sendDailyReminders = async () => {
  try {
    // Find users who haven't taken a quiz in the last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const inactiveUsers = await User.aggregate([
      {
        $lookup: {
          from: 'scores',
          localField: '_id',
          foreignField: 'user_id',
          as: 'scores'
        }
      },
      {
        $match: {
          $or: [
            { scores: { $size: 0 } },
            { 'scores.time_stamp_of_attempt': { $lt: threeDaysAgo } }
          ],
          role: 'user' // Only target non-admin users
        }
      }
    ]);

    console.log(`Found ${inactiveUsers.length} inactive users`);

    // Send email reminders
    for (const user of inactiveUsers) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Quiz Master - We miss you!',
        html: `
          <h2>Hello ${user.full_name},</h2>
          <p>We noticed you haven't taken any quizzes recently. Keep up with your learning by attempting a quiz today!</p>
          <p>Login to your Quiz Master account to continue your learning journey.</p>
          <p>Best regards,<br/>The Quiz Master Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${user.email}`);
    }

    // Send summary to Google Chat
    if (inactiveUsers.length > 0) {
      await sendGoogleChatNotification(
        `Daily Reminder Job: Sent reminders to ${inactiveUsers.length} inactive users.`
      );
    }

    return { success: true, count: inactiveUsers.length };
  } catch (error) {
    console.error('Error in sendDailyReminders:', error);
    throw error;
  }
};

module.exports = { sendDailyReminders }; 