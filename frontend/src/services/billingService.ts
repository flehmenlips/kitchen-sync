import apiService from './apiService';

export interface Subscription {
  id: number;
  restaurantId: number;
  plan: 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'HOME';
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAt?: string;
  canceledAt?: string;
  trialEndsAt?: string;
  seats: number;
  billingEmail?: string;
  billingName?: string;
  lastPaymentStatus?: string;
  lastPaymentDate?: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  amount: number;
  total: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  invoiceUrl?: string;
  invoicePdf?: string;
}

export interface PlanDetails {
  plan: string;
  name: string;
  price: number;
  features: string[];
}

const PLAN_DETAILS: Record<string, PlanDetails> = {
  TRIAL: {
    plan: 'TRIAL',
    name: 'Free Trial',
    price: 0,
    features: [
      'Full access for 14 days',
      'Up to 5 staff members',
      'All features included',
      'No credit card required'
    ]
  },
  STARTER: {
    plan: 'STARTER',
    name: 'Starter',
    price: 49,
    features: [
      'Up to 5 staff members',
      'Recipe management',
      'Prep lists',
      'Basic analytics',
      'Email support'
    ]
  },
  PROFESSIONAL: {
    plan: 'PROFESSIONAL',
    name: 'Professional',
    price: 149,
    features: [
      'Up to 20 staff members',
      'Everything in Starter',
      'Advanced analytics',
      'Customer portal',
      'Priority support'
    ]
  },
  HOME: {
    plan: 'HOME',
    name: 'Home',
    price: 299,
    features: [
      'Unlimited staff members',
      'Everything in Professional',
      'Custom integrations',
      'Dedicated support',
      'Custom training'
    ]
  }
};

class BillingService {
  async getSubscription(): Promise<Subscription> {
    const response = await apiService.get<Subscription>('/subscription');
    return response.data;
  }

  async getInvoices(): Promise<Invoice[]> {
    const response = await apiService.get<Invoice[]>('/subscription/invoices');
    return response.data;
  }

  async createCheckoutSession(plan: string, successUrl?: string, cancelUrl?: string): Promise<{ url: string }> {
    const response = await apiService.post<{ url: string }>('/subscription/checkout', {
      plan,
      successUrl: successUrl || `${window.location.origin}/settings/billing?success=true`,
      cancelUrl: cancelUrl || `${window.location.origin}/settings/billing?canceled=true`
    });
    return response.data;
  }

  async createBillingPortalSession(returnUrl?: string): Promise<{ url: string }> {
    const response = await apiService.post<{ url: string }>('/subscription/billing-portal', {
      returnUrl: returnUrl || `${window.location.origin}/settings/billing`
    });
    return response.data;
  }

  async cancelSubscription(): Promise<Subscription> {
    const response = await apiService.post<Subscription>('/subscription/cancel');
    return response.data;
  }

  getPlanDetails(plan: string): PlanDetails {
    return PLAN_DETAILS[plan] || PLAN_DETAILS.TRIAL;
  }

  getAllPlans(): PlanDetails[] {
    return Object.values(PLAN_DETAILS);
  }

  calculateDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
}

export const billingService = new BillingService(); 