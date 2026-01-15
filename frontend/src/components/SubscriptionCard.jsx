import { useState } from 'react';

const categoryColors = {
  Entertainment: '#e74c3c',
  Productivity: '#3498db',
  Cloud: '#9b59b6',
  Music: '#1db954',
  News: '#f39c12',
  Fitness: '#2ecc71',
  Other: '#95a5a6'
};

export default function SubscriptionCard({ subscription, onCancel }) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (confirm(`Cancel ${subscription.name}?`)) {
      setCancelling(true);
      await onCancel(subscription.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const categoryColor = categoryColors[subscription.category] || categoryColors.Other;

  return (
    <div className="subscription-card">
      <div className="card-header">
        <div
          className="category-badge"
          style={{ backgroundColor: categoryColor }}
        >
          {subscription.category}
        </div>
        <span className={`status ${subscription.isActive ? 'active' : 'inactive'}`}>
          {subscription.isActive ? 'Active' : 'Cancelled'}
        </span>
      </div>

      <h3 className="subscription-name">{subscription.name}</h3>

      <div className="subscription-details">
        <div className="amount">
          <span className="currency">{subscription.currency}</span>
          <span className="value">${subscription.amount.toFixed(2)}</span>
          <span className="cycle">/{subscription.billingCycle}</span>
        </div>

        <div className="dates">
          <div className="date-row">
            <span className="label">Next billing:</span>
            <span className="value">{formatDate(subscription.nextBillingDate)}</span>
          </div>
          <div className="date-row">
            <span className="label">Started:</span>
            <span className="value">{formatDate(subscription.startDate)}</span>
          </div>
        </div>
      </div>

      {subscription.isActive && (
        <button
          className="cancel-btn"
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      )}
    </div>
  );
}
