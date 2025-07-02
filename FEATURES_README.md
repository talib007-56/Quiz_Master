# Quiz Master - New Features Documentation

## 🚀 New Features Added

### 📥 CSV Export Functionality (Admin)
- **Quiz Data Export**: Export comprehensive quiz information including subjects, chapters, dates, and question counts
- **Quiz Attempts Export**: Export detailed student attempt data with scores, timestamps, and performance metrics  
- **User Engagement Export**: Export user activity data with engagement metrics and participation statistics

### 🔔 Email Notification System
- **Daily Reminders**: Automatic daily emails to inactive users (sent at 9:00 AM)
- **Monthly Reports**: Comprehensive monthly activity reports for all users (sent on 1st of each month at 1:00 AM)
- **Admin Engagement Notifications**: Weekly reports to admins about user engagement (sent every Monday at 8:00 AM)

## 🛠️ Setup Instructions

### Backend Configuration

1. **Install Dependencies** (if not already installed):
   ```bash
   cd backend
   npm install nodemailer node-cron
   ```

2. **Environment Variables**:
   Create a `.env` file in the backend directory with the following variables:
   ```env
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FRONTEND_URL=http://localhost:5173
   
   # Existing variables...
   MONGODB_URI=mongodb://localhost:27017/quiz-master
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5001
   ```

3. **Gmail Setup** (if using Gmail):
   - Enable 2-Factor Authentication on your Gmail account
   - Generate an App Password: Google Account → Security → App passwords
   - Use the generated app password in `SMTP_PASS`

### Frontend Updates

The frontend has been updated with:
- New Export tab in admin dashboard
- New Notifications tab in admin dashboard  
- User notification preferences page (can be added to user profile)

## 📋 API Endpoints

### Export Endpoints (Admin Only)
- `GET /api/export/quiz-data` - Export quiz data as CSV
- `GET /api/export/quiz-attempts` - Export quiz attempts as CSV
- `GET /api/export/user-engagement` - Export user engagement data as CSV

### Notification Endpoints
- `PUT /api/notifications/preferences/:userId` - Update user notification preferences
- `POST /api/notifications/trigger/daily-reminders` - Manually trigger daily reminders (Admin)
- `POST /api/notifications/trigger/monthly-reports` - Manually trigger monthly reports (Admin)
- `POST /api/notifications/trigger/engagement-notification` - Manually trigger engagement notifications (Admin)

## 🎯 Features Overview

### For Admins:
1. **Export Data**: 
   - Navigate to Admin Dashboard → Export tab
   - Click on any export button to download CSV files
   - Files include comprehensive data with proper headers

2. **Manage Notifications**:
   - Navigate to Admin Dashboard → Notifications tab
   - Manually trigger any notification type for testing
   - View automatic scheduling information

3. **Scheduled Notifications**:
   - Daily reminders: 9:00 AM every day (for inactive users)
   - Monthly reports: 1:00 AM on 1st of every month
   - Weekly engagement reports: 8:00 AM every Monday

### For Users:
1. **Notification Preferences**:
   - Users can manage their email preferences
   - Toggle daily reminders, monthly reports, and engagement notifications
   - Changes take effect immediately

2. **Email Types**:
   - **Daily Reminders**: Sent if inactive for 24+ hours
   - **Monthly Reports**: Comprehensive activity summary with statistics
   - **Engagement Notifications**: Achievement and milestone alerts

## 📊 CSV Export Data Structure

### Quiz Data Export
- Quiz ID, Subject, Chapter, Quiz Date, Duration, Remarks, Total Questions, Created At

### Quiz Attempts Export  
- Attempt ID, Student Name, Student Email, Subject, Chapter, Quiz Date, Attempt Date, Total Questions, Correct Answers, Total Score, Percentage

### User Engagement Export
- User ID, Name, Email, Registration Date, Total Attempts, Last Activity, Days Since Last Activity, Average Score, Engagement Status

## 🔧 Troubleshooting

### Email Issues:
1. **Emails not sending**: Check SMTP credentials and Gmail app password
2. **Gmail blocking**: Ensure 2FA is enabled and using app password
3. **Firewall issues**: Check if port 587 is open

### Export Issues:
1. **CSV not downloading**: Check browser download settings
2. **Empty files**: Verify data exists in database
3. **Permission errors**: Ensure user has admin role

### Cron Job Issues:
1. **Jobs not running**: Check server logs for cron initialization
2. **Timezone issues**: Cron runs in server timezone
3. **Memory issues**: Monitor server resources during bulk email sending

## 🚀 Usage Examples

### Admin Export Workflow:
1. Login as admin
2. Navigate to Dashboard → Export
3. Click "Export Quiz Attempts" 
4. CSV file downloads automatically
5. Open in Excel/Google Sheets for analysis

### User Notification Setup:
1. User navigates to notification settings
2. Toggle preferences as desired
3. Click "Save Preferences"
4. Receive confirmation message

## 📈 Future Enhancements

Potential improvements for future versions:
- PDF export options
- Custom date range exports
- Email template customization
- Advanced notification scheduling
- Real-time notification preferences in user dashboard
- Bulk user notification management

## 🔒 Security Considerations

- All export endpoints require admin authentication
- Email credentials stored securely in environment variables
- User preferences require user authentication
- CSV files contain no sensitive authentication data
- Email unsubscribe links included in all notifications 