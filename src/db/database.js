/**
 * Simple database abstraction layer
 * In production, this would use a real database like PostgreSQL or MySQL
 */

class Database {
  constructor() {
    this.connected = false;
    this.pool = null;
  }

  async connect(config) {
    // Simulate connection
    this.config = config;
    this.connected = true;
    console.log('Database connected');
    return this;
  }

  async query(sql, params = []) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    // For demo purposes, return mock data
    // In production, this would execute actual SQL
    console.log('Executing query:', sql, params);

    // Mock response based on query type
    if (sql.startsWith('SELECT')) {
      return this.mockSelect(sql, params);
    } else if (sql.startsWith('INSERT')) {
      return { insertId: Math.floor(Math.random() * 10000) };
    } else if (sql.startsWith('UPDATE') || sql.startsWith('DELETE')) {
      return { affectedRows: 1 };
    }

    return [];
  }

  mockSelect(sql, params) {
    // Return mock subscription data
    if (sql.includes('subscriptions')) {
      return [
        {
          id: 1,
          userId: params[0],
          name: 'Netflix',
          amount: 15.99,
          currency: 'USD',
          billingCycle: 'monthly',
          startDate: '2024-01-01',
          nextBillingDate: '2024-02-01',
          isActive: true,
          category: 'Entertainment'
        },
        {
          id: 2,
          userId: params[0],
          name: 'Spotify',
          amount: 9.99,
          currency: 'USD',
          billingCycle: 'monthly',
          startDate: '2024-01-15',
          nextBillingDate: '2024-02-15',
          isActive: true,
          category: 'Entertainment'
        }
      ];
    }
    return [];
  }

  async close() {
    this.connected = false;
    console.log('Database connection closed');
  }
}

module.exports = new Database();
