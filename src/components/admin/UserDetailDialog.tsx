import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  IconButton,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { formatDate } from '@/lib/utils';
import { UserRoles, getRoleName } from '@/lib/constants';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ open, onClose, user }) => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchUserShifts = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        // Los turnos en Firestore están almacenados con ID en formato "YYYY-MM-DD_M" o "YYYY-MM-DD_T"
        // donde M es mañana y T es tarde
        const shiftsRef = collection(db, 'shifts');
        const shiftsSnapshot = await getDocs(shiftsRef);
        
        // Procesar los resultados para encontrar los turnos donde está asignado el usuario
        const shiftsData = [];
        
        for (const shiftDoc of shiftsSnapshot.docs) {
          const data = shiftDoc.data();
          
          // Si el documento tiene asignaciones, buscar al usuario actual
          if (data.assignments && Array.isArray(data.assignments)) {
            const userAssigned = data.assignments.some(
              (assignment) => assignment.uid === user.uid
            );
            
            // Si el usuario está asignado a este turno, agregar a la lista
            if (userAssigned) {
              // El ID del documento tiene el formato "YYYY-MM-DD_M" o "YYYY-MM-DD_T"
              const [dateStr, shiftType] = shiftDoc.id.split('_');
              
              shiftsData.push({
                id: shiftDoc.id,
                date: dateStr,
                startTime: shiftType === 'M' ? '09:00' : '16:00',
                endTime: shiftType === 'M' ? '13:00' : '20:00',
                area: shiftType === 'M' ? 'Mañana' : 'Tarde',
                assignments: data.assignments,
              });
            }
          }
        }
        
        // Ordenar los turnos por fecha (más recientes primero)
        shiftsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setShifts(shiftsData);
      } catch (error) {
        console.error('Error fetching user shifts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && user) {
      fetchUserShifts();
    }
  }, [open, user]);

  if (!user) return null;

  // Separar turnos pendientes (futuros) y pasados
  const now = new Date();
  const upcomingShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate >= now;
  });
  
  const pastShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate < now;
  });

  // Función para renderizar un rol
  const renderRole = (roleId: number) => {
    let color = 'primary';
    if (roleId === UserRoles.ADMINISTRADOR) {
      color = 'error';
    } else if (roleId === UserRoles.RESPONSABLE) {
      color = 'success'; 
    }

    return (
      <Chip 
        key={roleId}
        label={getRoleName(roleId)}
        color={color as any}
        size="small"
        sx={{ mr: 1, mb: 1 }}
      />
    );
  };

  // Función para renderizar la tabla de turnos
  const renderShiftsTable = (shiftsData: any[]) => {
    if (shiftsData.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2 }}>
          No hay turnos para mostrar.
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Turno</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shiftsData.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>{formatDate(shift.date)}</TableCell>
                <TableCell>
                  {shift.area}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={"bold"} variant="body1">Detalles del Usuario</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Información del usuario */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1"  gutterBottom>
            {user.name} {user.lastname}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
            {Array.isArray(user.roles) 
              ? user.roles.map(renderRole)
              : user.role ? renderRole(user.role) : null}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Usuario: <strong>{user.username}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correo: <strong>{user.email}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teléfono: <strong>{user.phone}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Fecha de nacimiento: <strong>{user.birthdate ? formatDate(user.birthdate) : 'No disponible'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profesión: <strong>{user.job || 'No disponible'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Localidad: <strong>{user.location || 'No disponible'}</strong>
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Historial de turnos */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Historial de Turnos
        </Typography>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Turnos Pendientes (${upcomingShifts.length})`} />
          <Tab label={`Turnos Pasados (${pastShifts.length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {renderShiftsTable(upcomingShifts)}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderShiftsTable(pastShifts)}
            </TabPanel>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailDialog;