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
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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
  userId?: string;
  user?: any;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ 
  open, 
  onClose, 
  userId, 
  user: userProp 
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Efecto para cargar los datos del usuario si se proporciona un userId
  useEffect(() => {
    const fetchUserData = async () => {
      // Obtener el ID del usuario independientemente de la forma en que se proporcionó
      let userId: string | null = null;
      
      if (userProp && typeof userProp === 'object' && userProp.uid) {
        userId = userProp.uid;
        // Establecer datos provisionales mientras se carga la información completa
        setUserData(userProp);
      } else if (typeof userProp === 'string') {
        userId = userProp;
      } else if (typeof userId === 'string') {
        userId = userId;
      }
      
      if (!userId) {
        console.error('No se proporcionó un ID de usuario válido');
        return;
      }
      
      setUserLoading(true);
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData({
            uid: userId,
            ...data
          });
        } else {
          console.error('No se encontró el documento del usuario');
          // Si no encontramos el documento pero tenemos datos parciales, mantenerlos
          if (userProp && typeof userProp === 'object') {
            setUserData({
              uid: userId,
              ...userProp
            });
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        // Si ocurre un error pero tenemos datos parciales, mantenerlos
        if (userProp && typeof userProp === 'object') {
          setUserData({
            uid: userId,
            ...userProp
          });
        }
      } finally {
        setUserLoading(false);
      }
    };

    if (open) {
      fetchUserData();
    }
  }, [open, userId, userProp]);

  // Efecto para cargar los turnos del usuario
  useEffect(() => {
    const fetchUserShifts = async () => {
      if (!userData?.uid) return;
      
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
              (assignment) => assignment.uid === userData.uid
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

    if (open && userData) {
      fetchUserShifts();
    }
  }, [open, userData]);

  if (userLoading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!userData) return null;

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
            {userData.name} {userData.lastname}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
            {Array.isArray(userData.roles) 
              ? userData.roles.map(renderRole)
              : userData.role ? renderRole(userData.role) : null}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Usuario: <strong>{userData.username || 'No disponible'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correo: <strong>{userData.email || 'No disponible'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teléfono: <strong>{userData.phone || 'No disponible'}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Fecha de nacimiento: <strong>{userData.birthdate ? formatDate(userData.birthdate) : 'No disponible'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profesión: <strong>{userData.job || 'No disponible'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Localidad: <strong>{userData.location || 'No disponible'}</strong>
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