import React, { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { SubscriptionList } from '../components/subscriptions/SubscriptionList';
import { SubscriptionDetailModal } from '../components/subscriptions/SubscriptionDetailModal';
import { SubscriptionEditModal } from '../components/subscriptions/SubscriptionEditModal';
import { useSnackbar } from 'notistack';

export const SubscriptionsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  const handleViewDetails = (subscription: any) => {
    setSelectedSubscriptionId(subscription.id);
    setDetailModalOpen(true);
  };

  const handleEditSubscription = (subscription: any) => {
    setSelectedSubscription(subscription);
    setEditModalOpen(true);
  };

  const handleCancelSubscription = async (subscription: any) => {
    if (!confirm(`Are you sure you want to cancel the subscription for ${subscription.restaurant.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/subscriptions/${subscription.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          immediately: false,
          reason: 'Canceled by platform admin',
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');

      enqueueSnackbar('Subscription canceled successfully', { variant: 'success' });
      // Refresh the list
      window.location.reload();
    } catch (error) {
      enqueueSnackbar('Failed to cancel subscription', { variant: 'error' });
    }
  };

  const handleSaveSubscription = async (id: number, data: any) => {
    const response = await fetch(`/api/platform/subscriptions/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update subscription');
    }

    enqueueSnackbar('Subscription updated successfully', { variant: 'success' });
    // Refresh the list
    window.location.reload();
  };

  const handleOpenBillingPortal = async (customerId: string) => {
    try {
      // This would typically create a Stripe billing portal session
      // For now, we'll just show a message
      enqueueSnackbar('Billing portal integration coming soon', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar('Failed to open billing portal', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Subscription Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage restaurant subscriptions, billing, and plan changes.
        </Typography>

        <SubscriptionList
          onViewDetails={handleViewDetails}
          onEditSubscription={handleEditSubscription}
          onCancelSubscription={handleCancelSubscription}
        />

        <SubscriptionDetailModal
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedSubscriptionId(null);
          }}
          subscriptionId={selectedSubscriptionId}
          onOpenBillingPortal={handleOpenBillingPortal}
        />

        <SubscriptionEditModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedSubscription(null);
          }}
          subscription={selectedSubscription}
          onSave={handleSaveSubscription}
        />
      </Box>
    </Container>
  );
}; 