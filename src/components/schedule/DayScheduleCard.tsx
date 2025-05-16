import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ShiftRow from './ShiftRow.tsx';
import { ProcessedAssignments } from '@/hooks/schedule/useShiftsData';
import { CurrentUser, User } from '@/types/common'; // Importar User desde common
import { ShiftAssignment } from '@/store/api/shiftsApi';

interface DayScheduleCardProps {
  date: Date;
  dayKey: string;
  currentUser: CurrentUser | null;
  processedAssignments: ProcessedAssignments;
  usersMap: { [uid: string]: User };
  isUpdatingShift: { [key: string]: boolean };
  initiateShiftAction: (dateKey: string, shiftKey: "M" | "T") => Promise<void>;
  getShiftDisplayName: (shiftKey: "M" | "T") => string;
  handleAddUserButtonClick: (dateKey: string, shiftKey: "M" | "T") => void;
  handleRemoveUserClick: (assignment: ShiftAssignment, dateKey: string, shiftKey: "M" | "T") => void;
  handleVolunteerClick: (volunteer: ShiftAssignment) => Promise<void>;
}

const DayScheduleCard: React.FC<DayScheduleCardProps> = ({
  date,
  dayKey,
  currentUser,
  processedAssignments,
  usersMap,
  isUpdatingShift,
  initiateShiftAction,
  getShiftDisplayName,
  handleAddUserButtonClick,
  handleRemoveUserClick,
  handleVolunteerClick,
}) => {
  const dayAssignments = processedAssignments[dayKey] || { M: [], T: [] };
  
  // Formatos de fecha
  const dayOfWeek = format(date, 'EEEE', { locale: es });
  const formattedDate = format(date, 'd MMMM', { locale: es });

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            textTransform: 'capitalize',
            fontWeight: 'bold',
          }}
        >
          {dayOfWeek}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ textTransform: 'capitalize' }}
        >
          {formattedDate}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {['M', 'T'].map((shiftKey) => (
        <ShiftRow
          key={`${dayKey}_${shiftKey}`}
          dayKey={dayKey}
          shiftKey={shiftKey as "M" | "T"}
          shiftDisplayName={getShiftDisplayName(shiftKey as "M" | "T")}
          currentUser={currentUser}
          assignments={dayAssignments[shiftKey as "M" | "T"] || []}
          usersMap={usersMap}
          isLoading={isUpdatingShift[`${dayKey}_${shiftKey}_${currentUser?.uid || ''}`] || false}
          initiateShiftAction={initiateShiftAction}
          onAddUserClick={handleAddUserButtonClick}
          onRemoveUserClick={handleRemoveUserClick}
          onVolunteerClick={handleVolunteerClick}
        />
      ))}
    </Paper>
  );
};

export default DayScheduleCard;