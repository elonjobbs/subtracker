const db = require('./db/database');
const subscriptionService = require('./services/subscriptionService');
const notifications = require('./utils/notifications');

async function main() {
  try {
    // Initialize database connection
    await db.connect({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'subtracker',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD
    });

    console.log('SubTracker started');

    // Example usage
    const userId = 'user123';

    // Get user subscriptions
    const subscriptions = await subscriptionService.getUserSubscriptions(userId);
    console.log('User subscriptions:', subscriptions.length);

    // Get monthly spending
    const monthlySpending = await subscriptionService.getMonthlySpending(userId);
    console.log('Monthly spending: $' + monthlySpending.toFixed(2));

    // Get upcoming billings
    const upcoming = await subscriptionService.getUpcomingBillings(userId);
    console.log('Upcoming billings:', upcoming.length);

    // Send reminders
    await notifications.sendBillingReminders([userId]);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
