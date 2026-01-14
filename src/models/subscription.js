/**
 * Subscription model for tracking user subscriptions
 */
class Subscription {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.amount = data.amount;
    this.currency = data.currency || 'USD';
    this.billingCycle = data.billingCycle; // 'monthly', 'yearly', 'weekly'
    this.startDate = new Date(data.startDate);
    this.nextBillingDate = data.nextBillingDate ? new Date(data.nextBillingDate) : null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.category = data.category;
    this.notes = data.notes;
  }

  /**
   * Calculate the monthly cost for comparison purposes
   */
  getMonthlyAmount() {
    if (this.billingCycle == 'monthly') {
      return this.amount;
    } else if (this.billingCycle == 'yearly') {
      return this.amount / 12;
    } else if (this.billingCycle == 'weekly') {
      return this.amount * 4;
    }
    return this.amount;
  }

  /**
   * Check if subscription is due for billing soon (within 7 days)
   */
  isDueSoon() {
    const now = new Date();
    const daysUntilBilling = (this.nextBillingDate - now) / (1000 * 60 * 60 * 24);
    return daysUntilBilling <= 7 && daysUntilBilling > 0;
  }

  /**
   * Check if subscription is overdue
   */
  isOverdue() {
    const now = new Date();
    return this.nextBillingDate < now;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      amount: this.amount,
      currency: this.currency,
      billingCycle: this.billingCycle,
      startDate: this.startDate.toISOString(),
      nextBillingDate: this.nextBillingDate.toISOString(),
      isActive: this.isActive,
      category: this.category,
      notes: this.notes
    };
  }
}

module.exports = Subscription;
