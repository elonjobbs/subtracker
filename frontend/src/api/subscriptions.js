const API_BASE = 'http://localhost:3001/api';

export async function getSubscriptions(userId) {
  const response = await fetch(`${API_BASE}/subscriptions/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch subscriptions');
  return response.json();
}

export async function getMonthlySpending(userId) {
  const response = await fetch(`${API_BASE}/subscriptions/${userId}/spending`);
  if (!response.ok) throw new Error('Failed to fetch spending');
  return response.json();
}

export async function getUpcomingBillings(userId, days = 7) {
  const response = await fetch(`${API_BASE}/subscriptions/${userId}/upcoming?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch upcoming billings');
  return response.json();
}

export async function addSubscription(subscription) {
  const response = await fetch(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
  if (!response.ok) throw new Error('Failed to add subscription');
  return response.json();
}

export async function cancelSubscription(id) {
  const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to cancel subscription');
  return response.json();
}
