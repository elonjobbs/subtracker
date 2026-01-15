export default function SpendingSummary({ subscriptions, monthlySpending }) {
  const activeCount = subscriptions.filter(s => s.isActive).length;
  const yearlySpending = monthlySpending * 12;

  const categoryBreakdown = subscriptions
    .filter(s => s.isActive)
    .reduce((acc, sub) => {
      const category = sub.category || 'Other';
      acc[category] = (acc[category] || 0) + sub.amount;
      return acc;
    }, {});

  const sortedCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="spending-summary">
      <h2>Spending Overview</h2>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-label">Monthly</span>
          <span className="summary-value">${monthlySpending.toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Yearly</span>
          <span className="summary-value">${yearlySpending.toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Active</span>
          <span className="summary-value">{activeCount}</span>
        </div>
      </div>

      {sortedCategories.length > 0 && (
        <div className="category-breakdown">
          <h3>By Category</h3>
          <div className="category-bars">
            {sortedCategories.map(([category, amount]) => (
              <div key={category} className="category-row">
                <span className="category-name">{category}</span>
                <div className="bar-container">
                  <div
                    className="bar"
                    style={{
                      width: `${(amount / monthlySpending) * 100}%`
                    }}
                  />
                </div>
                <span className="category-amount">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
