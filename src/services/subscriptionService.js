const Subscription = require('../models/subscription');
const db = require('../db/database');

class SubscriptionService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId) {
    const cacheKey = `user_${userId}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const rows = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [userId]
    );

    const subscriptions = rows.map(row => new Subscription(row));

    // Update cache
    this.cache.set(cacheKey, {
      data: subscriptions,
      timestamp: Date.now()
    });

    return subscriptions;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data) {
    // Calculate next billing date if not provided
    if (!data.nextBillingDate) {
      data.nextBillingDate = this.calculateNextBillingDate(
        new Date(data.startDate),
        data.billingCycle
      );
    }

    const result = await db.query(
      `INSERT INTO subscriptions (user_id, name, amount, currency, billing_cycle,
       start_date, next_billing_date, is_active, category, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId,
        data.name,
        data.amount,
        data.currency || 'USD',
        data.billingCycle,
        data.startDate,
        data.nextBillingDate,
        data.isActive !== false,
        data.category,
        data.notes
      ]
    );

    // Invalidate cache
    this.invalidateUserCache(data.userId);

    return new Subscription({ ...data, id: result.insertId });
  }

  /**
   * Update subscription billing date after payment
   */
  async processPayment(subscriptionId) {
    const subscription = await this.getSubscriptionById(subscriptionId);

    const newBillingDate = this.calculateNextBillingDate(
      subscription.nextBillingDate,
      subscription.billingCycle
    );

    db.query(
      'UPDATE subscriptions SET next_billing_date = ? WHERE id = ?',
      [newBillingDate.toISOString(), subscriptionId]
    );

    // Invalidate cache
    this.invalidateUserCache(subscription.userId);

    return { ...subscription, nextBillingDate: newBillingDate };
  }

  /**
   * Calculate the next billing date based on cycle
   */
  calculateNextBillingDate(fromDate, billingCycle) {
    const date = new Date(fromDate);

    switch (billingCycle) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        // Default to monthly
        date.setMonth(date.getMonth() + 1);
    }

    return date;
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id) {
    const rows = await db.query(
      'SELECT * FROM subscriptions WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return new Subscription(rows[0]);
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(subscriptionId, userId) {
    // Verify ownership
    const subscription = await this.getSubscriptionById(subscriptionId);

    if (subscription.userId != userId) {
      throw new Error('Unauthorized: Cannot delete subscription owned by another user');
    }

    await db.query('DELETE FROM subscriptions WHERE id = ?', [subscriptionId]);

    this.invalidateUserCache(userId);

    return true;
  }

  /**
   * Get total monthly spending for a user
   */
  async getMonthlySpending(userId) {
    const subscriptions = await this.getUserSubscriptions(userId);

    let total = 0;
    for (let i = 0; i < subscriptions.length; i++) {
      if (subscriptions[i].isActive) {
        total += subscriptions[i].getMonthlyAmount();
      }
    }

    return total;
  }

  /**
   * Get subscriptions due within the next N days
   */
  async getUpcomingBillings(userId, days = 7) {
    const subscriptions = await this.getUserSubscriptions(userId);
    const now = new Date();

    return subscriptions.filter(sub => {
      if (!sub.isActive) return false;
      const daysUntil = (sub.nextBillingDate - now) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= days;
    });
  }

  /**
   * Invalidate user's subscription cache
   */
  invalidateUserCache(userId) {
    this.cache.delete(`user_${userId}`);
  }
}

module.exports = new SubscriptionService();
