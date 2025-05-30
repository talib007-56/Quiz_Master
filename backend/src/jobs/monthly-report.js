const User = require('../models/user.model');
const Score = require('../models/score.model');
const Quiz = require('../models/quiz.model');
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

// Generate and send monthly reports to all users
const generateMonthlyReports = async () => {
  try {
    // Get all active users
    const users = await User.find({ role: 'user' });
    console.log(`Found ${users.length} users for monthly reports`);

    // Get the previous month's date range
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
    
    const monthName = lastMonth.toLocaleString('default', { month: 'long' });
    const year = lastMonth.getFullYear();

    let reportsSent = 0;

    // Generate and send report for each user
    for (const user of users) {
      // Get user's quiz attempts for the previous month
      const quizAttempts = await Score.find({
        user_id: user._id,
        time_stamp_of_attempt: {
          $gte: lastMonth,
          $lte: lastMonthEnd
        }
      }).populate({
        path: 'quiz_id',
        populate: {
          path: 'chapter_id',
          populate: {
            path: 'subject_id'
          }
        }
      });

      // Skip if no activity
      if (quizAttempts.length === 0) {
        console.log(`No activity for user ${user.email} in ${monthName} ${year}, skipping`);
        continue;
      }

      // Calculate statistics
      const totalQuizzes = quizAttempts.length;
      const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.total_scored, 0);
      const maxPossibleScore = quizAttempts.reduce((sum, attempt) => {
        // Assuming each question is worth 1 point
        return sum + attempt.quiz_id.questions.length;
      }, 0);
      
      const averageScore = maxPossibleScore > 0 
        ? ((totalScore / maxPossibleScore) * 100).toFixed(2) 
        : 0;

      // Group attempts by subject
      const subjectPerformance = {};
      for (const attempt of quizAttempts) {
        const subjectName = attempt.quiz_id.chapter_id.subject_id.name;
        
        if (!subjectPerformance[subjectName]) {
          subjectPerformance[subjectName] = {
            attempts: 0,
            score: 0,
            maxScore: 0
          };
        }
        
        subjectPerformance[subjectName].attempts += 1;
        subjectPerformance[subjectName].score += attempt.total_scored;
        subjectPerformance[subjectName].maxScore += attempt.quiz_id.questions.length;
      }

      // Create HTML report
      let subjectRows = '';
      for (const [subject, data] of Object.entries(subjectPerformance)) {
        const subjectPercentage = ((data.score / data.maxScore) * 100).toFixed(2);
        subjectRows += `
          <tr>
            <td>${subject}</td>
            <td>${data.attempts}</td>
            <td>${data.score}/${data.maxScore}</td>
            <td>${subjectPercentage}%</td>
          </tr>
        `;
      }

      const emailHtml = `
        <h2>Monthly Activity Report: ${monthName} ${year}</h2>
        <p>Hello ${user.full_name},</p>
        
        <h3>Summary</h3>
        <p>Total Quizzes Attempted: ${totalQuizzes}</p>
        <p>Overall Score: ${totalScore}/${maxPossibleScore} (${averageScore}%)</p>
        
        <h3>Performance by Subject</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse">
          <tr>
            <th>Subject</th>
            <th>Quizzes Attempted</th>
            <th>Score</th>
            <th>Performance</th>
          </tr>
          ${subjectRows}
        </table>
        
        <p>Keep up the good work and continue your learning journey with Quiz Master!</p>
        
        <p>Best regards,<br>The Quiz Master Team</p>
      `;

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Quiz Master - Your ${monthName} ${year} Activity Report`,
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);
      console.log(`Monthly report sent to ${user.email}`);
      reportsSent++;
    }

    // Send summary to Google Chat
    await sendGoogleChatNotification(
      `Monthly Report Job: Generated and sent ${reportsSent} reports for ${monthName} ${year}.`
    );

    return { success: true, reportsSent };
  } catch (error) {
    console.error('Error in generateMonthlyReports:', error);
    throw error;
  }
};

module.exports = { generateMonthlyReports }; 