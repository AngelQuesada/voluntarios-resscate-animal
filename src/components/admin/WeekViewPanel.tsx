"use client";

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Divider,
  Alert,
  Button,
  LinearProgress
} from '@mui/material';
import { 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  format, 
  isWithinInterval, 
  parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetUsersQuery } from '@/store/api/usersApi';
import { useGetShiftsQuery } from '@/store/api/shiftsApi';
import { User } from '@/types/common';
import { ShiftAssignment } from '@/store/api/shiftsApi';

interface WeekViewPanelProps {
  onUserClick: (user: User) => void;
}

const WeekViewPanel: React.FC<WeekViewPanelProps> = ({ onUserClick }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [nextWeekStart, setNextWeekStart] = useState(startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }));
  const [showAllCurrentWeek, setShowAllCurrentWeek] = useState(false);
  const [showAllNextWeek, setShowAllNextWeek] = useState(false);

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });

  // Formato personalizado para mostrar el rango de fechas
  const formatWeekRange = (start: Date, end: Date) => {
    const startMonth = format(start, 'MMMM', { locale: es });
    const endMonth = format(end, 'MMMM', { locale: es });
    
    // Si los meses son diferentes
    if (startMonth !== endMonth) {
      return `${format(start, 'd', { locale: es })} de ${startMonth} al ${format(end, 'd', { locale: es })} de ${endMonth}`;
    }
    // Si los meses son iguales
    return `${format(start, 'd', { locale: es })} al ${format(end, 'd', { locale: es })} de ${startMonth}`;
  };

  // Texto para la semana actual y siguiente
  const currentWeekText = `Semana actual: ${formatWeekRange(currentWeekStart, currentWeekEnd)}`;
  const nextWeekText = `Semana siguiente: ${formatWeekRange(nextWeekStart, nextWeekEnd)}`;

  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetUsersQuery();
  const { data: shiftsData, isLoading: shiftsLoading, error: shiftsError } = useGetShiftsQuery({
    startDate: format(currentWeekStart, 'yyyy-MM-dd'),
    endDate: format(nextWeekEnd, 'yyyy-MM-dd'),
    users: {}
  });

  const enabledVolunteers = useMemo(() => {
    if (!usersData) return [];
    return Object.values(usersData).filter(
      user => user.isEnabled 
    );
  }, [usersData]);

  const getVolunteersWithoutShiftsInWeek = (weekStartDate: Date, weekEndDate: Date): User[] => {
    if (!shiftsData || !enabledVolunteers.length) return [];

    const volunteersWithShiftsInWeek = new Set<string>();

    Object.entries(shiftsData).forEach(([dateKey, dailyShifts]) => {
      const shiftDate = parseISO(dateKey); // La fecha se obtiene del dateKey
      if (isWithinInterval(shiftDate, { start: weekStartDate, end: weekEndDate })) {
        // dailyShifts es un objeto como { M?: ShiftAssignment[], T?: ShiftAssignment[] }
        Object.values(dailyShifts).forEach(assignmentsArray => { 
          // assignmentsArray es ShiftAssignment[] o undefined (para M o T)
          if (assignmentsArray) { 
            assignmentsArray.forEach((assignment: ShiftAssignment) => {
              volunteersWithShiftsInWeek.add(assignment.uid);
            });
          }
        });
      }
    });
    
    return enabledVolunteers.filter(volunteer => !volunteersWithShiftsInWeek.has(volunteer.uid));
  };

  const volunteersWithoutShiftsCurrentWeek = useMemo(() => 
    getVolunteersWithoutShiftsInWeek(currentWeekStart, currentWeekEnd), 
    [enabledVolunteers, shiftsData, currentWeekStart, currentWeekEnd]
  );

  const volunteersWithoutShiftsNextWeek = useMemo(() => 
    getVolunteersWithoutShiftsInWeek(nextWeekStart, nextWeekEnd), 
    [enabledVolunteers, shiftsData, nextWeekStart, nextWeekEnd]
  );

  // Calcular voluntarios con turnos asignados y los valores de progreso
  const totalVolunteers = enabledVolunteers.length;
  const volunteersWithShiftsCurrentWeek = totalVolunteers - volunteersWithoutShiftsCurrentWeek.length;
  const volunteersWithShiftsNextWeek = totalVolunteers - volunteersWithoutShiftsNextWeek.length;
  
  // Calcular porcentajes para las barras de progreso
  const currentWeekProgress = totalVolunteers > 0 ? (volunteersWithShiftsCurrentWeek / totalVolunteers) * 100 : 0;
  const nextWeekProgress = totalVolunteers > 0 ? (volunteersWithShiftsNextWeek / totalVolunteers) * 100 : 0;

  if (usersLoading || shiftsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando datos de la semana...</Typography>
      </Box>
    );
  }

  if (usersError || shiftsError) {
    return <Alert severity="error">Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.</Alert>;
  }
  
  const renderVolunteerList = (volunteers: User[], weekType: string, showAll: boolean, setShowAll: () => void) => {
    if (!volunteers.length) {
      return <Typography sx={{p:2, fontStyle: 'italic'}}>Todos los voluntarios habilitados tienen turnos asignados para {weekType}.</Typography>;
    }

    const volunteersToShow = showAll ? volunteers : volunteers.slice(0, 10);

    if (!volunteersToShow.length) {
      return <Typography sx={{p:2, fontStyle: 'italic'}}>No hay voluntarios sin turnos asignados para {weekType}.</Typography>;
    }

    return (
      <>
        <List dense>
          {volunteersToShow.map(volunteer => (
            <ListItem 
              key={volunteer.uid} 
              button 
              onClick={() => onUserClick(volunteer)}
              sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <ListItemText primary={`${volunteer.name} ${volunteer.lastname}`} />
            </ListItem>
          ))}
        </List>
        {!showAll && volunteers.length > 10 && (
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Button onClick={setShowAll} size="small">
              Ver más ({volunteers.length - 10} más)
            </Button>
          </Box>
        )}
      </>
    );
  };

  // Componente para la barra de progreso con texto
  const ProgressBarWithLabel = ({ value, label, isCurrentWeek, weekTitle }: { value: number, label: string, isCurrentWeek: boolean, weekTitle: string }) => (
    <Box sx={{ mb: 2 }}>
      <Typography 
        variant="h6" 
        component="div"
        sx={{
          mb: 2,
          py: 1,
          px: 2,
          fontWeight: 'bold',
          color: '#FFFFFF',
          borderColor: isCurrentWeek ? 'primary.dark' : 'primary.main',
          backgroundColor: isCurrentWeek ? 'primary.main' : 'primary.light',
          borderRadius: '4px 4px 0 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          width: '100%',
          position: 'relative',
        }}
      >
        {weekTitle}
      </Typography>

      <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
        <LinearProgress 
          variant="determinate" 
          value={value} 
          sx={{ 
            width: '100%', 
            height: 30, 
            borderRadius: 1,
            backgroundColor: isCurrentWeek ? 'rgba(7, 94, 28, 0.1)' : 'rgba(54, 137, 74, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: isCurrentWeek ? 'primary.main' : 'primary.light',
              transition: 'transform 0.4s ease'
            }
          }} 
        />
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <Typography 
            variant="body1" 
            component="div" 
            color="text.primary"
            sx={{ 
              fontWeight: 'bold',
              textShadow: '0px 0px 3px rgba(255, 255, 255, 0.8)'
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Paper elevation={3} sx={{ flex: 1, p: 2 }}>
        <ProgressBarWithLabel 
          value={currentWeekProgress} 
          label={`${volunteersWithShiftsCurrentWeek}/${totalVolunteers} voluntarios`}
          isCurrentWeek={true}
          weekTitle={currentWeekText}
        />
        
        <Typography variant="subtitle1" sx={{mb:1}}>Voluntarios sin turnos asignados:</Typography>
        {renderVolunteerList(volunteersWithoutShiftsCurrentWeek, 'la semana actual', showAllCurrentWeek, () => setShowAllCurrentWeek(true))}
      </Paper>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 2 }} />

      <Paper elevation={3} sx={{ flex: 1, p: 2 }}>
        <ProgressBarWithLabel 
          value={nextWeekProgress} 
          label={`${volunteersWithShiftsNextWeek}/${totalVolunteers} voluntarios`}
          isCurrentWeek={false}
          weekTitle={nextWeekText}
        />
        
        <Typography variant="subtitle1" sx={{mb:1}}>Voluntarios sin turnos asignados:</Typography>
        {renderVolunteerList(volunteersWithoutShiftsNextWeek, 'la semana siguiente', showAllNextWeek, () => setShowAllNextWeek(true))}
      </Paper>
    </Box>
  );
};

export default WeekViewPanel;