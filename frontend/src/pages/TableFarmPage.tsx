import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ListAlt as ListIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { ReservationCalendar } from '../components/tablefarm/ReservationCalendar';
// import { ReservationList } from '../components/tablefarm/ReservationList';
// import { OrderManagement } from '../components/tablefarm/OrderManagement';
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const TableFarmPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          TableFarm - Reservation & Order Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage customer reservations, table assignments, and order processing
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="Calendar View"
            icon={<CalendarIcon />}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab
            label="Reservations List"
            icon={<ListIcon />}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab
            label="Order Management"
            icon={<AddIcon />}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab
            label="Analytics"
            icon={<AssessmentIcon />}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ReservationCalendar />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Reservation List View
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon: View and manage all reservations in a list format
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Order Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon: Create and manage customer orders
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon: View reservation and order analytics
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </>
  );
}; 