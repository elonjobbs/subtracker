import { useState, useEffect } from 'react';
import SubscriptionCard from './SubscriptionCard';
import SpendingSummary from './SpendingSummary';
import { getSubscriptions, getMonthlySpending, cancelSubscription } from '../api/subscriptions';

export default function Dashboard({ userId }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [subs, spending] = await Promise.all([
        getSubscriptions(userId),
        getMonthlySpending(userId)
      ]);
      setSubscriptions(subs);
      setMonthlySpending(spending.monthlySpending);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(subscriptionId) {
    try {
      await cancelSubscription(subscriptionId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'all') return true;
    if (filter === 'active') return sub.isActive;
    if (filter === 'cancelled') return !sub.isActive;
    return sub.category === filter;
  });

  const categories = [...new Set(subscriptions.map(s => s.category))];

  if (loading) {
    return <div className="loading">Loading your subscriptions...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={loadData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SubTracker</h1>
        <p>Manage your subscriptions in one place</p>
      </header>

      <SpendingSummary
        subscriptions={subscriptions}
        monthlySpending={monthlySpending}
      />

      <div className="subscriptions-section">
        <div className="section-header">
          <h2>Your Subscriptions</h2>
          <div className="filters">
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <optgroup label="Categories">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No subscriptions found</p>
          </div>
        ) : (
          <div className="subscriptions-grid">
            {filteredSubscriptions.map(sub => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
