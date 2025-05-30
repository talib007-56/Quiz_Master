const cron = require('node-cron');
const { sendDailyReminders } = require('./daily-reminder');
const { generateMonthlyReports } = require('./monthly-report');

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
    await generateMonthlyReports();
    console.log('Monthly report job completed');
  } catch (error) {
    console.error('Monthly report job failed:', error);
  }
});

console.log('Cron jobs scheduled'); 