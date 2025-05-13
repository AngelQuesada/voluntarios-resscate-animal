"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  Button // Añadir Button
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
import { useGetUsersQuery } from '@/store/api/usersApi'; // Corregido
import { useGetShiftsQuery } from '@/store/api/shiftsApi'; // Corregido
import { User } from '@/types/common'; // Corregido para ser más específico
import { ShiftAssignment } from '@/store/api/shiftsApi';
import { UserRoles } from '@/lib/constants'; // Añadido para filtrar roles

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

  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetUsersQuery();
  const { data: shiftsData, isLoading: shiftsLoading, error: shiftsError } = useGetShiftsQuery({
    startDate: format(currentWeekStart, 'yyyy-MM-dd'),
    endDate: format(nextWeekEnd, 'yyyy-MM-dd'),
    // Pasamos un objeto vacío para users si no queremos filtrar por usuario específico aquí,
    // o si la API no lo requiere para obtener todos los turnos en el rango.
    // La API de turnos actual parece procesar los usuarios internamente.
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

    if (!volunteersToShow.length) {
      return <Typography sx={{p:2, fontStyle: 'italic'}}>No hay voluntarios sin turnos asignados para {weekType}.</Typography>;
    }

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

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Paper elevation={3} sx={{ flex: 1, p: 2 }}>
        <Typography variant="h6" gutterBottom component="div">
          Semana Actual
        </Typography>
        <Chip 
          label={`Del ${format(currentWeekStart, 'dd MMM yyyy', { locale: es })} al ${format(currentWeekEnd, 'dd MMM yyyy', { locale: es })}`}
          color="primary"
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle1" sx={{mb:1}}>Voluntarios sin turnos asignados:</Typography>
        {renderVolunteerList(volunteersWithoutShiftsCurrentWeek, 'la semana actual', showAllCurrentWeek, () => setShowAllCurrentWeek(true))}
      </Paper>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 2 }} />

      <Paper elevation={3} sx={{ flex: 1, p: 2 }}>
        <Typography variant="h6" gutterBottom component="div">
          Semana Siguiente
        </Typography>
        <Chip 
          label={`Del ${format(nextWeekStart, 'dd MMM yyyy', { locale: es })} al ${format(nextWeekEnd, 'dd MMM yyyy', { locale: es })}`}
          color="secondary"
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle1" sx={{mb:1}}>Voluntarios sin turnos asignados:</Typography>
        {renderVolunteerList(volunteersWithoutShiftsNextWeek, 'la semana siguiente', showAllNextWeek, () => setShowAllNextWeek(true))}
      </Paper>
    </Box>
  );
};

export default WeekViewPanel;