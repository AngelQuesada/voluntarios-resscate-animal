import React from 'react';
import { Tabs, Tab, Box, Badge } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { triggerVibration } from '@/lib/vibration'; // Added import

interface ScheduleTabsProps {
  activeTab: number;
  myShiftsCount: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const ScheduleTabsComponent: React.FC<ScheduleTabsProps> = ({
  activeTab,
  myShiftsCount,
  handleTabChange,
}) => {
  // Wrapped original handleTabChange to add vibration
  const handleTabChangeWithVibration = (event: React.SyntheticEvent, newValue: number) => {
    triggerVibration(30); // Added vibration call
    handleTabChange(event, newValue); // Call original handler
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChangeWithVibration} // Updated to use the new handler
          aria-label="Pestañas de calendario"
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
        <Tab 
          icon={<CalendarTodayIcon />} 
          label="Todos los turnos" 
          id="tab-0"
          aria-controls="tabpanel-0"
        />
        <Tab 
          icon={
            <Badge 
              badgeContent={myShiftsCount} 
              color="primary"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  right: -3,
                  top: 3,
                },
              }}
            >
              <AssignmentIndIcon />
            </Badge>
          } 
          label="Mis turnos" 
          id="tab-1"
          aria-controls="tabpanel-1"
        />
      </Tabs>
    </Box>
  );
};

export default ScheduleTabsComponent;