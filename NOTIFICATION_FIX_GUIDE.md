# 🚨 Notification System Fix Guide

## Issues Found and Fixed

### 1. **Missing Email Configuration**
The main issue is the missing `.env` file with proper email credentials.

### 2. **Fixed Files**
- ✅ Updated `backend/src/jobs/daily-reminder.js` to use consistent SMTP variables
- ✅ Updated `backend/src/jobs/monthly-report.js` to use consistent SMTP variables
- ✅ Main notification controller already uses correct SMTP variables

## 🔧 **REQUIRED: Create .env File**

**CRITICAL**: You must create a `.env` file in the `backend/` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/quiz-master

# JWT Configuration  
JWT_SECRET=your_jwt_secret_key_here_please_change_this

# Email Configuration (REQUIRED for notifications)
# Replace with your actual Gmail credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_16_character_app_password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=5001
NODE_ENV=development

# Optional: Google Chat Webhook for admin notifications
# GOOGLE_CHAT_WEBHOOK=your_google_chat_webhook_url_here
```

## 📧 **Gmail Setup Instructions**

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Turn on 2-Step Verification

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "App passwords" (requires 2FA enabled)
3. Select "Mail" and "Other (custom name)"
4. Enter "Quiz Master" as the app name
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Replace the placeholder values:
- `your_actual_email@gmail.com` → Your real Gmail address
- `your_16_character_app_password` → The app password from Step 2

## 🧪 **Testing the Fix**

### 1. Restart the Backend Server
```bash
cd backend
npm run dev
```

### 2. Test Email Configuration
1. Login as admin in the frontend
2. Go to Admin Dashboard → Notifications
3. Click "🧪 Test Email" button
4. Enter your email address
5. Check if you receive the test email

### 3. Test Individual Features

**Daily Reminders:**
```bash
# Make a POST request to trigger manually
curl -X POST http://localhost:5001/api/notifications/trigger/daily-reminders \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Monthly Reports:**
```bash
# Make a POST request to trigger manually
curl -X POST http://localhost:5001/api/notifications/trigger/monthly-reports \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Engagement Reports:**
```bash
# Make a POST request to trigger manually
curl -X POST http://localhost:5001/api/notifications/trigger/engagement-notification \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 📅 **Automatic Scheduling**

The system automatically runs:
- **Daily Reminders**: 9:00 AM every day (for users inactive 24+ hours)
- **Monthly Reports**: 1:00 AM on 1st of every month
- **Weekly Engagement Reports**: 8:00 AM every Monday

## 🔍 **Debugging**

### Check Backend Console Logs
Look for these indicators:
- ✅ Green checkmarks = Success
- ❌ Red X marks = Errors
- 📧 Email icons = Email sending attempts
- 📊 Chart icons = Data processing

### Common Error Messages:
1. **"Email credentials not configured"**
   - Solution: Check if SMTP_USER and SMTP_PASS are set in .env
   - Restart the server after changing .env

2. **"Authentication failed"**
   - Solution: Verify your Gmail app password is correct
   - Make sure 2FA is enabled on your Google account

3. **"Connection timeout"**
   - Solution: Check your internet connection
   - Try using port 465 with secure: true

## 🎯 **Verification Checklist**

- [ ] `.env` file created in `backend/` directory
- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] `.env` file configured with real credentials
- [ ] Backend server restarted
- [ ] Test email sent successfully
- [ ] Backend logs show ✅ success messages
- [ ] Users receive notification emails

## 🔐 **Security Notes**

- Never commit your `.env` file to version control
- Use app passwords, not your regular email password
- Keep your SMTP credentials secure
- The `.env` file is already in `.gitignore`

## 📞 **Still Having Issues?**

If emails still don't work after following these steps:

1. **Check Backend Logs**: Look for detailed error messages in the server console
2. **Test SMTP Settings**: Use the test email feature to isolate the problem
3. **Try Different Email Provider**: Some networks block Gmail SMTP
4. **Check Firewall**: Ensure ports 587/465 are not blocked

Once all steps are completed, your email notifications should work perfectly!
