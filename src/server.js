const express = require('express');
const cors = require('cors');
const subscriptionService = require('./services/subscriptionService');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database
db.connect({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'subtracker',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD
});

// Get all subscriptions for a user
app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getUserSubscriptions(req.params.userId);
    res.json(subscriptions.map(sub => sub.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly spending
app.get('/api/subscriptions/:userId/spending', async (req, res) => {
  try {
    const total = await subscriptionService.getMonthlySpending(req.params.userId);
    res.json({ monthlySpending: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming billings
app.get('/api/subscriptions/:userId/upcoming', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const upcoming = await subscriptionService.getUpcomingBillings(req.params.userId, days);
    res.json(upcoming.map(sub => sub.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const subscription = await subscriptionService.addSubscription(req.body);
    res.status(201).json(subscription.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a subscription
app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    await subscriptionService.cancelSubscription(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscriptions by category
app.get('/api/subscriptions/:userId/category/:category', async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getByCategory(
      req.params.userId,
      req.params.category
    );
    res.json(subscriptions.map(sub => sub.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SubTracker API running on http://localhost:${PORT}`);
});
