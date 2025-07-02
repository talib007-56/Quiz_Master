# 📧 Email Notification Setup Guide

## 🚨 Quick Fix for Email Notifications Not Working

The email notifications are not working because the email configuration is missing. Follow these steps to fix it:

## 📋 Step 1: Configure Gmail App Password

### For Gmail Users (Recommended):

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Turn on 2-Step Verification

2. **Generate an App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "App passwords" (you need 2FA enabled first)
   - Select "Mail" and "Other (custom name)"
   - Enter "Quiz Master" as the app name
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

## 📋 Step 2: Configure Environment Variables

Edit the `.env` file in your `backend` directory and replace the email settings:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/quiz-master

# JWT Configuration  
JWT_SECRET=your_jwt_secret_key_here_please_change_this

# Email Configuration (REQUIRED for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_16_character_app_password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=5001
NODE_ENV=development
```

### ⚠️ Important:
- Replace `your_actual_email@gmail.com` with your real Gmail address
- Replace `your_16_character_app_password` with the app password from Step 1
- **DO NOT** use your regular Gmail password!

## 📋 Step 3: Test the Configuration

1. **Restart your backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test email functionality**:
   - Login as admin in the frontend
   - Go to Dashboard → Notifications tab
   - Click "🧪 Send Test Email" button
   - Enter your email address
   - Check if you receive the test email

## 📋 Step 4: Debugging

If emails still don't work, check the backend console for error messages:

### Common Issues:

1. **"Email credentials not configured"**:
   - Check if SMTP_USER and SMTP_PASS are set in .env
   - Restart the server after changing .env

2. **"Authentication failed"**:
   - Verify your Gmail app password is correct
   - Make sure 2FA is enabled on your Google account

3. **"Connection timeout"**:
   - Check your internet connection
   - Try using port 465 with secure: true

### Alternative SMTP Configuration (if Gmail doesn't work):

```env
# For Gmail with SSL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Or use other providers:

```env
# For Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password

# For Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
```

## 📋 Step 5: Verify Everything Works

1. **Test Email**: Use the test button to verify SMTP works
2. **Daily Reminders**: Click "Send Daily Reminders" and check logs
3. **Monthly Reports**: Click "Send Monthly Reports" and check logs
4. **Engagement Reports**: Click "Send Engagement Report" and check logs

## 🔍 Debugging Logs

The backend now includes detailed logging. Watch the console for:
- ✅ Green checkmarks = Success
- ❌ Red X marks = Errors
- 📧 Email icons = Email sending attempts
- 📊 Chart icons = Data processing

## 📞 Still Having Issues?

If emails still don't work after following these steps:

1. **Check Backend Logs**: Look for detailed error messages in the server console
2. **Test SMTP Settings**: Use the test email feature to isolate the problem
3. **Try Different Email Provider**: Some networks block Gmail SMTP
4. **Check Firewall**: Ensure ports 587/465 are not blocked

## 🔐 Security Notes

- Never commit your .env file to version control
- Use app passwords, not your regular email password
- Keep your SMTP credentials secure
- The .env file is already in .gitignore

## ✅ Success Checklist

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] .env file configured with real credentials
- [ ] Backend server restarted
- [ ] Test email sent successfully
- [ ] Backend logs show ✅ success messages
- [ ] Users receive notification emails

Once all steps are completed, your email notifications should work perfectly! 