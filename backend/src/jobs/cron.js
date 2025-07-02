const cron = require('node-cron');
const { 
  sendDailyReminders,
  sendMonthlyReports,
  sendEngagementNotification
} = require('../controllers/notification.controller');

// Schedule daily reminders at 9:00 AM every day
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily reminder job...');
  try {
    await sendDailyReminders();
    console.log('Daily reminder job completed');
  } catch (error) {
    console.error('Daily reminder job failed:', error);
  }
});

// Schedule monthly reports on the 1st of every month at 1:00 AM
cron.schedule('0 1 1 * *', async () => {
  console.log('Running monthly report job...');
  try {
    await sendMonthlyReports();
    console.log('Monthly report job completed');
  } catch (error) {
    console.error('Monthly report job failed:', error);
  }
});

// Schedule weekly engagement notifications every Monday at 8:00 AM
cron.schedule('0 8 * * 1', async () => {
  console.log('Running weekly engagement notification job...');
  try {
    await sendEngagementNotification();
    console.log('Weekly engagement notification job completed');
  } catch (error) {
    console.error('Weekly engagement notification job failed:', error);
  }
});

console.log('Cron jobs scheduled:');
console.log('- Daily reminders: 9:00 AM every day');
console.log('- Monthly reports: 1:00 AM on the 1st of every month'); 
console.log('- Weekly engagement notifications: 8:00 AM every Monday'); 