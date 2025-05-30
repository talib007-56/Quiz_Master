const { Queue, Worker } = require('bullmq');
const dotenv = require('dotenv');

dotenv.config();

// Redis connection options
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};

// Create job queues
const emailQueue = new Queue('email-queue', { connection: redisConnection });
const reportQueue = new Queue('report-queue', { connection: redisConnection });

// Create email worker
const emailWorker = new Worker('email-queue', async (job) => {
  try {
    console.log(`Processing email job ${job.id}`);
    
    // Process email jobs based on type
    switch (job.data.type) {
      case 'reminder':
        // Code to send reminder emails would go here
        console.log(`Sending reminder email to ${job.data.email}`);
        break;
      case 'report':
        // Code to send report emails would go here
        console.log(`Sending report email to ${job.data.email}`);
        break;
      default:
        console.log(`Unknown email job type: ${job.data.type}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error processing email job ${job.id}:`, error);
    throw error;
  }
}, { connection: redisConnection });

// Create report worker
const reportWorker = new Worker('report-queue', async (job) => {
  try {
    console.log(`Processing report job ${job.id}`);
    
    // Process report generation
    console.log(`Generating ${job.data.reportType} report for user ${job.data.userId}`);
    
    // After report generation, queue an email job to send the report
    await emailQueue.add('send-report', {
      type: 'report',
      email: job.data.email,
      reportData: { /* Report data would go here */ }
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error processing report job ${job.id}:`, error);
    throw error;
  }
}, { connection: redisConnection });

// Handle worker events
emailWorker.on('completed', job => {
  console.log(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, error) => {
  console.error(`Email job ${job.id} failed:`, error);
});

reportWorker.on('completed', job => {
  console.log(`Report job ${job.id} completed successfully`);
});

reportWorker.on('failed', (job, error) => {
  console.error(`Report job ${job.id} failed:`, error);
});

module.exports = { emailQueue, reportQueue }; 