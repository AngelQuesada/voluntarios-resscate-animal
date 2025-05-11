'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import UserDetailDialog from '../admin/UserDetailDialog';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRoles } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

interface Volunteer {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  roles?: number[];
  shift: 'M' | 'T';
}

interface VolunteersListProps {
  selectedDate: Date;
}

const VolunteersList: React.FC<VolunteersListProps> = ({ selectedDate }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      try {
        // Convertir fecha al formato usado en tu base de datos
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        
        // Consultar la colección de shifts para la fecha seleccionada
        const shiftsRef = collection(db, 'shifts');
        const q = query(shiftsRef, where("date", "==", dateString));
        
        const shiftsSnapshot = await getDocs(q);
        const volunteersData: Volunteer[] = [];
        
        // Procesar los datos de los turnos
        for (const docSnapshot of shiftsSnapshot.docs) {
          const shiftData = docSnapshot.data();
          
          // Determinar el tipo de turno (M o T)
          const shift = shiftData.shift || (docSnapshot.id.endsWith('_M') ? 'M' : 'T');
          
          // Procesar asignaciones
          if (shiftData.assignments && Array.isArray(shiftData.assignments)) {
            for (const volunteer of shiftData.assignments) {
              if (volunteer.uid) {
                // Obtener información adicional del usuario si está disponible
                let userData = {
                  roles: volunteer.roles || [],
                  email: volunteer.email || '',
                  phone: volunteer.phone || '',
                  photoURL: volunteer.photoURL || ''
                };
                
                // Si hay roles u otra información que falta, intentar obtenerla de Firestore
                if (!userData.roles.length || !userData.email) {
                  try {
                    const userDocRef = doc(db, 'users', volunteer.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                      const userDocData = userDocSnap.data();
                      userData = {
                        ...userData,
                        roles: userDocData.roles || [],
                        email: userDocData.email || volunteer.email || '',
                        phone: userDocData.phone || volunteer.phone || '',
                        photoURL: userDocData.photoURL || volunteer.photoURL || ''
                      };
                    }
                  } catch (error) {
                    console.error("Error al obtener datos de usuario:", error);
                  }
                }
                
                volunteersData.push({
                  id: volunteer.uid,
                  uid: volunteer.uid,
                  name: volunteer.name || 'Desconocido',
                  email: userData.email,
                  phone: userData.phone,
                  photoURL: userData.photoURL,
                  roles: userData.roles,
                  shift
                });
              }
            }
          }
          
          // Si estamos almacenando separados por M y T
          if (shift === 'M' && shiftData.M && Array.isArray(shiftData.M)) {
            for (const volunteer of shiftData.M) {
              if (volunteer.uid) {
                volunteersData.push({
                  id: volunteer.uid,
                  uid: volunteer.uid,
                  name: volunteer.name || 'Desconocido',
                  email: volunteer.email || '',
                  phone: volunteer.phone || '',
                  photoURL: volunteer.photoURL || '',
                  roles: volunteer.roles,
                  shift: 'M'
                });
              }
            }
          }
          
          if (shift === 'T' && shiftData.T && Array.isArray(shiftData.T)) {
            for (const volunteer of shiftData.T) {
              if (volunteer.uid) {
                volunteersData.push({
                  id: volunteer.uid,
                  uid: volunteer.uid,
                  name: volunteer.name || 'Desconocido',
                  email: volunteer.email || '',
                  phone: volunteer.phone || '',
                  photoURL: volunteer.photoURL || '',
                  roles: volunteer.roles,
                  shift: 'T'
                });
              }
            }
          }
        }
        
        // Filtrar posibles duplicados por ID
        const uniqueVolunteers = Array.from(
          new Map(volunteersData.map(v => [v.id + v.shift, v])).values()
        );
        
        setVolunteers(uniqueVolunteers);
      } catch (error) {
        console.error("Error al obtener voluntarios:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchVolunteers();
    }
  }, [selectedDate]);

  const handleVolunteerClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVolunteer(null);
  };

  // Función para determinar el color según el rol
  const getRoleColor = (roles?: number[]) => {
    if (!roles) return "text.secondary";
    if (roles.includes(UserRoles.RESPONSABLE)) return "success.main";
    return "primary.light";
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Filtrar por turno - usando 'M' y 'T'
  const morningVolunteers = volunteers.filter(v => v.shift === 'M');
  const afternoonVolunteers = volunteers.filter(v => v.shift === 'T');

  const renderVolunteerChips = (volunteersList: Volunteer[]) => {
    if (volunteersList.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Nadie asignado
        </Typography>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
        }}
      >
        {volunteersList.map((volunteer) => {
          const isCurrentUser = user?.uid === volunteer.uid;
          const roleColor = getRoleColor(volunteer.roles);
          
          // En la página de historial, todos los voluntarios son clicables
          const canViewProfile = true;

          const Content = (
            <Box
              sx={{
                borderRadius: "8px",
                padding: "2px 6px",
                display: "flex",
                alignItems: "center",
                width: "fit-content",
                backgroundColor: roleColor,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": { filter: "brightness(0.9)" },
              }}
            >
              <Typography
                variant="caption"
                onClick={() => handleVolunteerClick(volunteer)}
                sx={{
                  color: "white",
                  fontWeight: isCurrentUser ? 600 : 400,
                  fontSize: "0.7rem",
                  userSelect: "none",
                  cursor: 'pointer',
                }}
              >
                {volunteer.name}
                {isCurrentUser && " (Tú)"}
              </Typography>
            </Box>
          );

          return (
            <Tooltip key={volunteer.id} title="Ver perfil" arrow>
              {Content}
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" component="h3" gutterBottom>
        Voluntarios del {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
      </Typography>

      {volunteers.length === 0 ? (
        <Typography variant="body1">No se encontraron voluntarios para esta fecha.</Typography>
      ) : (
        <>
          {/* Voluntarios del turno de mañana */}
          <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Turno de Mañana
            </Typography>
            {renderVolunteerChips(morningVolunteers)}
          </Paper>

          {/* Voluntarios del turno de tarde */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Turno de Tarde
            </Typography>
            {renderVolunteerChips(afternoonVolunteers)}
          </Paper>
        </>
      )}

      {/* Diálogo de detalles del usuario */}
      {selectedVolunteer && (
        <UserDetailDialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          user={selectedVolunteer} 
        />
      )}
    </Box>
  );
};

export default VolunteersList;