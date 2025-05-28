import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Skeleton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  CancelPresentation,
  Speed,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import subscriptionService from '../services/subscriptionService';

interface AnalyticsData {
  byStatus: Array<{ status: string; _count: number }>;
  byPlan: Array<{ plan: string; _count: number }>;
  mrr: number;
  churnRate: string;
  newSubscriptions: number;
  totalActive: number;
}

interface MonthlyMetric {
  month: string;
  mrr: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  churned: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change && change >= 0;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositive ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={isPositive ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {isPositive ? '+' : ''}{change}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const SubscriptionAnalytics: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyMetric[]>([]);

  useEffect(() => {
    fetchAnalytics();
    generateMockMonthlyData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock monthly data for the charts
  const generateMockMonthlyData = () => {
    const data: MonthlyMetric[] = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const monthName = format(date, 'MMM yyyy');
      
      // Generate realistic-looking data
      const baseActive = 50 + (11 - i) * 8;
      const mrr = baseActive * 75; // Average of different plans
      
      data.push({
        month: monthName,
        mrr: mrr + Math.random() * 1000 - 500,
        activeSubscriptions: baseActive + Math.floor(Math.random() * 10 - 5),
        newSubscriptions: Math.floor(Math.random() * 15 + 5),
        churned: Math.floor(Math.random() * 5),
      });
    }

    setMonthlyData(data);
  };

  const planColors = {
    TRIAL: theme.palette.grey[400],
    STARTER: theme.palette.primary.main,
    PROFESSIONAL: theme.palette.secondary.main,
    HOME: theme.palette.warning.main,
  };

  const statusColors = {
    TRIAL: theme.palette.info.main,
    ACTIVE: theme.palette.success.main,
    PAST_DUE: theme.palette.warning.main,
    CANCELED: theme.palette.error.main,
    SUSPENDED: theme.palette.error.dark,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const planPrices = {
    TRIAL: 0,
    STARTER: 49,
    PROFESSIONAL: 149,
    HOME: 299,
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box py={4}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Subscription Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Monitor subscription performance, revenue trends, and customer behavior.
        </Typography>

        {/* Key Metrics */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Monthly Recurring Revenue"
              value={formatCurrency(analytics?.mrr || 0)}
              change={12.5}
              icon={<AttachMoney sx={{ color: 'success.main' }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Subscriptions"
              value={analytics?.totalActive || 0}
              change={8.3}
              icon={<People sx={{ color: 'primary.main' }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Churn Rate"
              value={`${analytics?.churnRate || '0'}%`}
              change={-2.1}
              icon={<CancelPresentation sx={{ color: 'error.main' }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="New This Month"
              value={analytics?.newSubscriptions || 0}
              change={15.7}
              icon={<Speed sx={{ color: 'secondary.main' }} />}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* MRR Trend */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                MRR Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value: any) => `$${value}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.light}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Plan Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Plan Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.byPlan || []}
                    dataKey="_count"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry: any) => `${entry.plan}: ${entry._count}`}
                  >
                    {analytics?.byPlan.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={planColors[entry.plan as keyof typeof planColors] || theme.palette.grey[500]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Subscription Growth */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subscription Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activeSubscriptions"
                    stroke={theme.palette.primary.main}
                    name="Active"
                  />
                  <Line
                    type="monotone"
                    dataKey="newSubscriptions"
                    stroke={theme.palette.success.main}
                    name="New"
                  />
                  <Line
                    type="monotone"
                    dataKey="churned"
                    stroke={theme.palette.error.main}
                    name="Churned"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Status Breakdown */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Status Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.byStatus || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="_count" name="Count">
                    {analytics?.byStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.status as keyof typeof statusColors] || theme.palette.grey[500]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Detailed Breakdown Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Plan Breakdown
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan</TableCell>
                      <TableCell align="right">Subscriptions</TableCell>
                      <TableCell align="right">Base Price</TableCell>
                      <TableCell align="right">Est. MRR</TableCell>
                      <TableCell align="right">% of Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.byPlan.map((plan) => {
                      const basePrice = planPrices[plan.plan as keyof typeof planPrices] || 0;
                      const estimatedMRR = plan._count * basePrice;
                      const percentage = ((plan._count / analytics.totalActive) * 100).toFixed(1);

                      return (
                        <TableRow key={plan.plan}>
                          <TableCell>
                            <Chip
                              label={plan.plan}
                              size="small"
                              sx={{
                                backgroundColor: planColors[plan.plan as keyof typeof planColors],
                                color: 'white',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">{plan._count}</TableCell>
                          <TableCell align="right">{formatCurrency(basePrice)}</TableCell>
                          <TableCell align="right">{formatCurrency(estimatedMRR)}</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 