import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  People as PeopleIcon,
  Badge as BadgeIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import CustomerManagement from '../components/admin/CustomerManagement';
import StaffManagement from '../components/admin/StaffManagement';
import AdminAnalytics from '../components/admin/AdminAnalytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage customers, staff, and view analytics
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin dashboard tabs"
            variant={isMobile ? 'fullWidth' : 'standard'}
          >
            <Tab 
              label="Analytics" 
              icon={<DashboardIcon />} 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              label="Customers" 
              icon={<PeopleIcon />} 
              iconPosition="start"
              {...a11yProps(1)} 
            />
            <Tab 
              label="Staff" 
              icon={<BadgeIcon />} 
              iconPosition="start"
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <AdminAnalytics />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <CustomerManagement />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <StaffManagement />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminDashboard; 