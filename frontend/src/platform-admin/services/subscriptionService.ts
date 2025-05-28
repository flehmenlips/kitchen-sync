import { API_URL } from '../../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('platformToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface SubscriptionListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface Subscription {
  id: number;
  restaurant: {
    id: number;
    name: string;
    slug: string;
    ownerEmail: string;
    ownerName: string;
  };
  plan: 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'HOME';
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelAt?: string;
  canceledAt?: string;
  seats: number;
  billingEmail?: string;
  billingName?: string;
  billingAddress?: any;
  stripeCustomerId?: string;
  stripeSubId?: string;
  _count: {
    invoices: number;
    usageRecords: number;
  };
  invoices?: any[];
  usageRecords?: any[];
}

const subscriptionService = {
  // Get subscriptions with filters
  async getSubscriptions(params: SubscriptionListParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.plan) queryParams.append('plan', params.plan);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_URL}/platform/subscriptions?${queryParams}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    return response.json();
  },

  // Get single subscription
  async getSubscription(id: number) {
    const response = await fetch(`${API_URL}/platform/subscriptions/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }

    return response.json();
  },

  // Update subscription
  async updateSubscription(id: number, data: any) {
    const response = await fetch(`${API_URL}/platform/subscriptions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update subscription');
    }

    return response.json();
  },

  // Cancel subscription
  async cancelSubscription(id: number, data: { immediately?: boolean; reason?: string }) {
    const response = await fetch(`${API_URL}/platform/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return response.json();
  },

  // Get subscription analytics
  async getAnalytics() {
    const response = await fetch(`${API_URL}/platform/subscriptions/analytics`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    return response.json();
  },
};

export default subscriptionService; 