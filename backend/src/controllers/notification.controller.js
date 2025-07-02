const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const Score = require('../models/score.model');

// Email transporter configuration
const createTransporter = () => {
  // Debug email configuration
  console.log('📧 Email Configuration Check:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Email credentials not configured! Please set SMTP_USER and SMTP_PASS in .env file');
    throw new Error('Email credentials not configured');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Update user notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dailyReminders, monthlyReports, engagementNotifications } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          notification_preferences: {
            daily_reminders: dailyReminders !== undefined ? dailyReminders : true,
            monthly_reports: monthlyReports !== undefined ? monthlyReports : true,
            engagement_notifications: engagementNotifications !== undefined ? engagementNotifications : true,
            updated_at: new Date()
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Notification preferences updated successfully',
      preferences: user.notification_preferences 
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Failed to update notification preferences', error: error.message });
  }
};

// Send daily reminder to inactive users
const sendDailyReminders = async () => {
  try {
    console.log('🔔 Starting daily reminders process...');
    
    const transporter = createTransporter();
    console.log('✅ Email transporter created successfully');
    
    // Test transporter connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP connection failed:', verifyError.message);
      throw verifyError;
    }
    
    // Find users who haven't been active in the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    console.log('📅 Checking for users inactive since:', yesterday.toISOString());
    
    const recentScores = await Score.find({
      time_stamp_of_attempt: { $gte: yesterday }
    }).distinct('user_id');
    console.log(`📊 Found ${recentScores.length} users active in last 24 hours`);

    const inactiveUsers = await User.find({
      role: 'user',
      _id: { $nin: recentScores },
      $or: [
        { 'notification_preferences.daily_reminders': { $ne: false } },
        { notification_preferences: { $exists: false } }
      ]
    });

    console.log(`📋 Found ${inactiveUsers.length} inactive users for daily reminders`);
    
    if (inactiveUsers.length === 0) {
      console.log('✨ No inactive users found - all users are active!');
      return { success: true, count: 0, message: 'No inactive users found' };
    }

    for (const user of inactiveUsers) {
      const userScores = await Score.find({ user_id: user._id })
        .sort({ time_stamp_of_attempt: -1 })
        .limit(1);

      const lastActivity = userScores.length > 0 ? 
        userScores[0].time_stamp_of_attempt : 
        user.created_at;

      const daysSinceLastActivity = Math.floor(
        (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastActivity >= 1) {
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: user.email,
          subject: '🎯 Don\'t forget to practice! - Quiz Master',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">🎯 Quiz Master</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Learning never stops!</p>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa; border-radius: 15px; margin-top: 20px;">
                <h2 style="color: #2c3e50; margin-top: 0;">Hi ${user.full_name}! 👋</h2>
                
                <p style="color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                  We noticed you haven't taken any quizzes in the last ${daysSinceLastActivity} day${daysSinceLastActivity > 1 ? 's' : ''}. 
                  Don't let your learning streak break!
                </p>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
                  <h3 style="color: #2c3e50; margin-top: 0;">🚀 Ready to continue learning?</h3>
                  <p style="color: #5a6c7d; margin-bottom: 20px;">Jump back in and test your knowledge!</p>
                  
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                    Take a Quiz Now →
                  </a>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0;">
                    Keep learning, keep growing! 📚✨
                  </p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #6c757d; font-size: 12px;">
                  Don't want these reminders? 
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/notifications" 
                     style="color: #667eea;">Update your preferences</a>
                </p>
              </div>
            </div>
          `
        };

        try {
          console.log(`📧 Attempting to send daily reminder to ${user.email}...`);
          const result = await transporter.sendMail(mailOptions);
          console.log(`✅ Daily reminder sent successfully to ${user.email}`, {
            messageId: result.messageId,
            response: result.response
          });
        } catch (emailError) {
          console.error(`❌ Failed to send daily reminder to ${user.email}:`, {
            error: emailError.message,
            code: emailError.code,
            command: emailError.command
          });
        }
      }
    }

    return { success: true, count: inactiveUsers.length };

  } catch (error) {
    console.error('Error sending daily reminders:', error);
    return { success: false, error: error.message };
  }
};

// Send monthly activity report
const sendMonthlyReports = async () => {
  try {
    const transporter = createTransporter();
    
    // Get users who want monthly reports
    const users = await User.find({
      role: 'user',
      $or: [
        { 'notification_preferences.monthly_reports': { $ne: false } },
        { notification_preferences: { $exists: false } }
      ]
    });

    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    console.log(`Generating monthly reports for ${users.length} users`);

    for (const user of users) {
      // Get user's activity for the last month
      const monthlyScores = await Score.find({
        user_id: user._id,
        time_stamp_of_attempt: {
          $gte: lastMonth,
          $lt: thisMonth
        }
      }).populate('quiz_id');

      const totalAttempts = monthlyScores.length;
      const totalScore = monthlyScores.reduce((sum, score) => sum + score.total_scored, 0);
      const averageScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0;
      const bestScore = totalAttempts > 0 ? Math.max(...monthlyScores.map(s => s.total_scored)) : 0;

      // Get total questions answered correctly
      const totalCorrect = monthlyScores.reduce((sum, score) => 
        sum + (score.answers?.filter(a => a.is_correct).length || 0), 0
      );
      const totalQuestions = monthlyScores.reduce((sum, score) => 
        sum + (score.answers?.length || 0), 0
      );
      const accuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;

      const monthName = lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: `📊 Your ${monthName} Learning Report - Quiz Master`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">📊 Quiz Master</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Monthly Learning Report</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 15px; margin-top: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">Hi ${user.full_name}! 👋</h2>
              <p style="color: #5a6c7d; font-size: 16px;">Here's your learning summary for <strong>${monthName}</strong>:</p>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #e3f2fd;">
                  <div style="font-size: 32px; font-weight: bold; color: #1976d2;">${totalAttempts}</div>
                  <div style="color: #5a6c7d; font-size: 14px;">Quiz Attempts</div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #e8f5e8;">
                  <div style="font-size: 32px; font-weight: bold; color: #388e3c;">${averageScore}</div>
                  <div style="color: #5a6c7d; font-size: 14px;">Average Score</div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #fff3e0;">
                  <div style="font-size: 32px; font-weight: bold; color: #f57c00;">${bestScore}</div>
                  <div style="color: #5a6c7d; font-size: 14px;">Best Score</div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #fce4ec;">
                  <div style="font-size: 32px; font-weight: bold; color: #c2185b;">${accuracy}%</div>
                  <div style="color: #5a6c7d; font-size: 14px;">Accuracy</div>
                </div>
              </div>
              
              ${totalAttempts > 0 ? `
                <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #2c3e50; margin-top: 0;">🎉 Great Progress!</h3>
                  <p style="color: #5a6c7d;">You answered <strong>${totalCorrect}</strong> questions correctly out of <strong>${totalQuestions}</strong> total questions.</p>
                </div>
              ` : `
                <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ff9800;">
                  <h3 style="color: #2c3e50; margin-top: 0;">📚 Ready to Start?</h3>
                  <p style="color: #5a6c7d;">You haven't taken any quizzes last month. Start your learning journey today!</p>
                </div>
              `}
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  Continue Learning →
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="color: #6c757d; font-size: 14px; margin: 0;">
                  Keep up the excellent work! 🌟
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #6c757d; font-size: 12px;">
                Don't want monthly reports? 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/notifications" 
                   style="color: #667eea;">Update your preferences</a>
              </p>
            </div>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Monthly report sent to ${user.email}`);
      } catch (emailError) {
        console.error(`Failed to send monthly report to ${user.email}:`, emailError);
      }
    }

    return { success: true, count: users.length };

  } catch (error) {
    console.error('Error sending monthly reports:', error);
    return { success: false, error: error.message };
  }
};

// Send engagement notifications to admin
const sendEngagementNotification = async () => {
  try {
    const transporter = createTransporter();
    
    // Find admin users
    const admins = await User.find({ role: 'admin' });
    
    // Get user engagement data
    const users = await User.find({ role: 'user' });
    const scores = await Score.find().populate('user_id', 'email full_name');
    
    const now = Date.now();
    const inactiveUsers = [];
    const activeUsers = [];
    
    for (const user of users) {
      const userScores = scores.filter(s => s.user_id?._id?.toString() === user._id.toString());
      const lastActivity = userScores.length > 0 ? 
        Math.max(...userScores.map(s => new Date(s.time_stamp_of_attempt).getTime())) : 
        new Date(user.created_at).getTime();
      
      const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastActivity > 7) {
        inactiveUsers.push({ user, days: daysSinceLastActivity });
      } else {
        activeUsers.push({ user, days: daysSinceLastActivity });
      }
    }

    for (const admin of admins) {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: admin.email,
        subject: '📈 Weekly User Engagement Report - Quiz Master Admin',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">📈 Quiz Master Admin</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">User Engagement Report</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 15px; margin-top: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">Hello Admin! 👋</h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #e8f5e8;">
                  <div style="font-size: 32px; font-weight: bold; color: #388e3c;">${activeUsers.length}</div>
                  <div style="color: #5a6c7d; font-size: 14px;">Active Users</div>
                  <div style="color: #6c757d; font-size: 12px;">(Last 7 days)</div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #ffebee;">
                  <div style="font-size: 32px; font-weight: bold; color: #d32f2f;">${inactiveUsers.length}</div>
                  <div style="color: #5a6c7d; font-size: 14px;">Inactive Users</div>
                  <div style="color: #6c757d; font-size: 12px;">(7+ days ago)</div>
                </div>
              </div>
              
              ${inactiveUsers.length > 0 ? `
                <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #2c3e50; margin-top: 0;">⚠️ Users Needing Attention</h3>
                  <div style="max-height: 200px; overflow-y: auto;">
                    ${inactiveUsers.slice(0, 10).map(({ user, days }) => `
                      <div style="padding: 10px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between;">
                        <span style="color: #2c3e50;">${user.full_name}</span>
                        <span style="color: #6c757d; font-size: 14px;">${days} days inactive</span>
                      </div>
                    `).join('')}
                    ${inactiveUsers.length > 10 ? `
                      <div style="padding: 10px; color: #6c757d; font-style: italic;">
                        And ${inactiveUsers.length - 10} more users...
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : `
                <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #4caf50;">
                  <h3 style="color: #2c3e50; margin-top: 0;">🎉 Excellent Engagement!</h3>
                  <p style="color: #5a6c7d;">All users are actively participating in quizzes!</p>
                </div>
              `}
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  View Admin Dashboard →
                </a>
              </div>
            </div>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Engagement notification sent to admin ${admin.email}`);
      } catch (emailError) {
        console.error(`Failed to send engagement notification to ${admin.email}:`, emailError);
      }
    }

    return { success: true, count: admins.length };

  } catch (error) {
    console.error('Error sending engagement notifications:', error);
    return { success: false, error: error.message };
  }
};

// Manual trigger endpoints for testing
const triggerDailyReminders = async (req, res) => {
  try {
    const result = await sendDailyReminders();
    res.json({ message: 'Daily reminders triggered', result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to trigger daily reminders', error: error.message });
  }
};

const triggerMonthlyReports = async (req, res) => {
  try {
    const result = await sendMonthlyReports();
    res.json({ message: 'Monthly reports triggered', result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to trigger monthly reports', error: error.message });
  }
};

const triggerEngagementNotification = async (req, res) => {
  try {
    const result = await sendEngagementNotification();
    res.json({ message: 'Engagement notification triggered', result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to trigger engagement notification', error: error.message });
  }
};

// Test email endpoint for debugging
const testEmail = async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');
    
    const transporter = createTransporter();
    
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP connection test passed');
    
    // Get admin user for test
    const testEmail = req.body.email || process.env.SMTP_USER;
    
    const testMailOptions = {
      from: process.env.SMTP_USER,
      to: testEmail,
      subject: '🧪 Quiz Master Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🧪 Email Test Successful!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your email configuration is working correctly.</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 15px; margin-top: 20px;">
            <p style="color: #2c3e50;">This is a test email to verify that your Quiz Master notification system is properly configured.</p>
            <p style="color: #6c757d; font-size: 14px;">
              <strong>Test Details:</strong><br>
              • SMTP Host: ${process.env.SMTP_HOST}<br>
              • SMTP Port: ${process.env.SMTP_PORT}<br>
              • From: ${process.env.SMTP_USER}<br>
              • To: ${testEmail}<br>
              • Timestamp: ${new Date().toISOString()}
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully:', result.messageId);
    
    res.json({ 
      success: true,
      message: 'Test email sent successfully',
      details: {
        messageId: result.messageId,
        from: process.env.SMTP_USER,
        to: testEmail,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Email test failed', 
      error: error.message,
      details: {
        smtpHost: process.env.SMTP_HOST || 'NOT SET',
        smtpUser: process.env.SMTP_USER || 'NOT SET',
        smtpPassSet: !!process.env.SMTP_PASS
      }
    });
  }
};

module.exports = {
  updateNotificationPreferences,
  sendDailyReminders,
  sendMonthlyReports,
  sendEngagementNotification,
  triggerDailyReminders,
  triggerMonthlyReports,
  triggerEngagementNotification,
  testEmail
}; 