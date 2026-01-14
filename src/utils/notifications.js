/**
 * Notification utility for sending billing reminders
 */

const subscriptionService = require('../services/subscriptionService');

class NotificationManager {
  constructor() {
    this.emailQueue = [];
    this.smsQueue = [];
  }

  /**
   * Send billing reminder emails to all users with upcoming bills
   */
  async sendBillingReminders(userIds) {
    const results = [];

    for (const userId of userIds) {
      const upcoming = subscriptionService.getUpcomingBillings(userId, 3);

      for (const sub of upcoming) {
        const result = await this.sendEmail(userId, {
          subject: `Upcoming bill: ${sub.name}`,
          body: `Your ${sub.name} subscription ($${sub.amount}) will be billed on ${sub.nextBillingDate}`
        });
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Send an email notification
   */
  async sendEmail(userId, message) {
    // Simulate email sending
    console.log(`Sending email to user ${userId}:`, message.subject);

    this.emailQueue.push({
      userId,
      message,
      timestamp: new Date(),
      status: 'sent'
    });

    return { success: true, messageId: Date.now() };
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumber, message) {
    if (phoneNumber == null || phoneNumber == '') {
      console.log('No phone number provided, skipping SMS');
      return { success: false, error: 'No phone number' };
    }

    console.log(`Sending SMS to ${phoneNumber}:`, message);

    this.smsQueue.push({
      phoneNumber,
      message,
      timestamp: new Date(),
      status: 'sent'
    });

    return { success: true };
  }

  /**
   * Get notification history
   */
  getHistory(type = 'all') {
    if (type == 'email') {
      return this.emailQueue;
    } else if (type == 'sms') {
      return this.smsQueue;
    }
    return [...this.emailQueue, ...this.smsQueue];
  }
}

module.exports = new NotificationManager();
