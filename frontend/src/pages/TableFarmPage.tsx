import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ListAlt as ListIcon,
  Receipt as OrderIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { ReservationCalendar } from '../components/tablefarm/ReservationCalendar';
import OrderListPage from './OrderListPage';
import ReservationManagementPage from './ReservationManagementPage';
import ReservationSettingsPage from './ReservationSettingsPage';
// import { TableFarmAnalytics } from '../components/tablefarm/TableFarmAnalytics';

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
      id={`tablefarm-tabpanel-${index}`}
      aria-labelledby={`tablefarm-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const TableFarmPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
            mr: 3
          }}>
            <CalendarIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              fontWeight="800"
              sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.5
              }}
            >
              TableFarm
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Reservation & Order Management
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 15, fontSize: '1rem' }}>
          Manage customer reservations, table assignments, and order processing
        </Typography>
      </Box>

      <Paper sx={{ 
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: '12px 12px 0 0',
                mx: 0.5,
                minHeight: 56,
                '&.Mui-selected': {
                  background: 'rgba(255,255,255,0.8)',
                  color: '#1e40af'
                },
                '&:hover': {
                  background: 'rgba(255,255,255,0.5)'
                }
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                height: '3px',
                borderRadius: '2px'
              }
            }}
          >
            <Tab
              label="Calendar View"
              icon={<CalendarIcon />}
              iconPosition="start"
            />
            <Tab
              label="Reservations List"
              icon={<ListIcon />}
              iconPosition="start"
            />
            <Tab
              label="Orders"
              icon={<OrderIcon />}
              iconPosition="start"
            />
            <Tab
              label="Settings"
              icon={<SettingsIcon />}
              iconPosition="start"
            />
            <Tab
              label="Analytics"
              icon={<AssessmentIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ 
            py: 4,
            background: 'rgba(255,255,255,0.3)',
            minHeight: '400px'
          }}>
            <ReservationCalendar />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ 
            py: 4,
            background: 'rgba(255,255,255,0.3)',
            minHeight: '400px'
          }}>
            <ReservationManagementPage />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ 
            py: 4,
            background: 'rgba(255,255,255,0.3)',
            minHeight: '400px'
          }}>
            <OrderListPage />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ 
            py: 4,
            background: 'rgba(255,255,255,0.3)',
            minHeight: '400px'
          }}>
            <ReservationSettingsPage />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box sx={{ 
            py: 6, 
            textAlign: 'center',
            background: 'rgba(255,255,255,0.3)',
            minHeight: '400px'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
              borderRadius: '30px',
              mx: 'auto',
              mb: 4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <AssessmentIcon sx={{ fontSize: 60, color: '#64748b' }} />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Analytics Dashboard Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Track reservations, orders, and customer insights
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}; 