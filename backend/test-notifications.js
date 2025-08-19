#!/usr/bin/env node

/**
 * Notification System Test Script
 * Run this script to test your notification configuration
 * 
 * Usage: node test-notifications.js
 */

const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config();

const testNotificationSystem = async () => {
  console.log('🧪 Testing Quiz Master Notification System...\n');

  // Check environment variables
  console.log('📋 Environment Configuration:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NOT SET');
  console.log();

  // Check if required variables are set
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ CRITICAL ERROR: Email credentials not configured!');
    console.error('Please set SMTP_USER and SMTP_PASS in your .env file');
    console.error('Refer to NOTIFICATION_FIX_GUIDE.md for instructions');
    process.exit(1);
  }

  try {
    // Create transporter
    console.log('📧 Creating email transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Test connection
    console.log('🔗 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('📤 Sending test email...');
    const testEmail = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: '🧪 Quiz Master Notification Test - SUCCESS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Test Successful!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your Quiz Master notification system is working correctly!</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 15px; margin-top: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Configuration Test Results ✅</h2>
            
            <p style="color: #5a6c7d; font-size: 16px; line-height: 1.6;">
              This test email confirms that your email configuration is working properly. 
              Your notification system is ready to send:
            </p>
            
            <ul style="color: #5a6c7d; font-size: 16px; line-height: 1.8;">
              <li>📅 Daily reminders to inactive users</li>
              <li>📊 Monthly activity reports</li>
              <li>📈 Weekly engagement notifications to admins</li>
            </ul>
            
            <div style="background: white; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #2c3e50; margin-top: 0;">📋 Test Details</h3>
              <p style="color: #5a6c7d; font-size: 14px; margin: 0;">
                <strong>SMTP Host:</strong> ${process.env.SMTP_HOST}<br>
                <strong>SMTP Port:</strong> ${process.env.SMTP_PORT}<br>
                <strong>From Email:</strong> ${process.env.SMTP_USER}<br>
                <strong>Test Time:</strong> ${new Date().toISOString()}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                🚀 Your Quiz Master notification system is ready to go!
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📬 Check your email inbox for the test message');

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('Your notification system is properly configured and ready to use.');
    console.log('\n📋 Next steps:');
    console.log('1. Start your backend server: npm run dev');
    console.log('2. Test manual triggers from the admin dashboard');
    console.log('3. Notifications will run automatically based on the schedule');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔧 AUTHENTICATION ERROR - Possible solutions:');
      console.error('1. Check if your Gmail app password is correct');
      console.error('2. Make sure 2-Factor Authentication is enabled');
      console.error('3. Generate a new app password if needed');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🔧 CONNECTION ERROR - Possible solutions:');
      console.error('1. Check your internet connection');
      console.error('2. Try using port 465 instead of 587');
      console.error('3. Check if your firewall blocks SMTP ports');
    } else {
      console.error('\n🔧 GENERAL ERROR - Check your configuration:');
      console.error('1. Verify all SMTP_* variables are set correctly');
      console.error('2. Restart your application after changing .env');
      console.error('3. Refer to NOTIFICATION_FIX_GUIDE.md for help');
    }
    
    process.exit(1);
  }
};

// Run the test
testNotificationSystem().catch(console.error);
