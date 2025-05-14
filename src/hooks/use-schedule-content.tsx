import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format, parseISO, eachDayOfInterval, addDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { Typography, Box, Tooltip, IconButton, CircularProgress, useTheme } from "@mui/material";
import { UserRoles } from "@/lib/constants";
import { useGetShiftsQuery, useGetUserShiftsQuery, useModifyShiftMutation, type ShiftAssignment } from "@/store/api/shiftsApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Image from "next/image";

// --- Interfaces ---

interface CurrentUser extends Omit<FirebaseUser, "providerData"> {
  providerData?: any[];
  name?: string;
  lastname?: string;
  roles?: number[];
  phone?: string;
}

interface ShiftDocumentData {
  id: string; // (YYYY-MM-DD_M)
  date: string; // (YYYY-MM-DD)
  dayName?: string;
  shift: "M" | "T";
  assignments: { uid: string }[];
  lastUpdated?: string;
}

interface UseScheduleContentOptions {
  startDate?: Date;
  endDate?: Date; 
}

interface UseScheduleContentResult {
  processedAssignments: {
    [dateKey: string]: {
      // YYYY-MM-DD
      M?: ShiftAssignment[];
      T?: ShiftAssignment[];
    };
  };
  filteredAssignments: {
    [dateKey: string]: {
      M?: ShiftAssignment[];
      T?: ShiftAssignment[];
    };
  };
  shifts: ShiftDocumentData[]; 
  isUpdatingShift: { [key: string]: boolean }; // YYYY-MM-DD_M o YYYY-MM-DD_T
  isLoading: boolean;
  authLoading: boolean;
  currentUser: CurrentUser | null;
  error: string | null;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: "success" | "error" | "info" | "warning";
  showSnackbar: (
    message: string,
    severity?: "success" | "error" | "info" | "warning"
  ) => void;
  handleSnackbarClose: (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => void;
  shiftsTimeKeys: ("M" | "T")[];
  getShiftDisplayName: (shiftKey: "M" | "T") => string;
  dateRange: Date[]; 
  endDate: Date; 
  renderShiftAssignmentList: (
    dayKey: string,
    shiftKey: "M" | "T"
  ) => React.ReactNode;
  selectedVolunteer: ShiftAssignment | null;
  contactDialogOpen: boolean;
  setContactDialogOpen: (open: boolean) => void;
  handleVolunteerClick: (volunteer: ShiftAssignment) => Promise<void>;

  activeTab: number;
  myShiftsCount: number;
  confirmDialogOpen: boolean;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void; // Updated signature
  initiateShiftAction: (dateKey: string, shiftKey: "M" | "T") => Promise<void>;
  confirmShiftAction: () => Promise<void>;
  cancelShiftAction: () => void;

  removeUserConfirmOpen: boolean;
  setRemoveUserConfirmOpen: (open: boolean) => void;
  userToRemoveDetails: { uid: string; name: string; dateKey: string; shiftKey: "M" | "T" } | null;
  handleRemoveUserClick: (assignment: ShiftAssignment, dateKey: string, shiftKey: "M" | "T") => void;
  confirmRemoveUser: () => Promise<void>;
  cancelRemoveUser: () => void;

  addUserDialogOpen: boolean;
  setAddUserDialogOpen: (open: boolean) => void;
  shiftForUserAssignment: { dateKey: string; shiftKey: "M" | "T" } | null;
  handleAddUserButtonClick: (dateKey: string, shiftKey: "M" | "T") => void;
  confirmAddUserToShift: (userId: string) => Promise<void>; // User ID to add
  cancelAddUser: () => void;
  allUsersList: { id: string; name?: string; lastname?: string, roles?: number[] }[];
  renderLoadingScreen: () => React.ReactNode;
}

// --- The Custom Hook ---

export function useScheduleContent({
  startDate = new Date(),
  endDate,
}: UseScheduleContentOptions): UseScheduleContentResult {
  // --- Estados ---
  const [isUpdatingShift, setIsUpdatingShift] = useState<
    UseScheduleContentResult["isUpdatingShift"]
  >({});
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<UseScheduleContentResult["snackbarSeverity"]>("info");
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<ShiftAssignment | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [shiftToAction, setShiftToAction] = useState<{ dateKey: string; shiftKey: "M" | "T"; } | null>(null);
  const [initialTabLogicApplied, setInitialTabLogicApplied] = useState(false);

  const [removeUserConfirmOpen, setRemoveUserConfirmOpen] = useState(false);
  const [userToRemoveDetails, setUserToRemoveDetails] = useState<{ uid: string; name: string; dateKey: string; shiftKey: "M" | "T" } | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [shiftForUserAssignment, setShiftForUserAssignment] = useState<{ dateKey: string; shiftKey: "M" | "T" } | null>(null);


  const auth = getAuth();

  const theme = useTheme();

  // --- Calcular el rango de fechas ---
  // Nos aseguramos de que las fechas sean válidas
  const safeEndDate =
    endDate && !isNaN(endDate.getTime()) ? endDate : addDays(startDate, 6);

  const dateRange = eachDayOfInterval({ start: startDate, end: safeEndDate });

  // Convertir fechas a formato ISO para que sean serializables
  const startDateISO = startDate.toISOString();
  const endDateISO = safeEndDate.toISOString();

  // Cargar todos los usuarios una sola vez
  const {
    data: usersMap = {},
    isLoading: usersLoading
  } = useGetUsersQuery();

  const allUsersList = useMemo(() => {
    return Object.entries(usersMap).map(([uid, user]) => ({
      id: uid,
      name: user.name,
      lastname: user.lastname,
      roles: user.roles,
    }));
  }, [usersMap]);

  // --- RTK Query Hooks ---
  const {
    data: processedAssignments = {},
    isLoading: shiftsLoading,
    error: shiftsError
  } = useGetShiftsQuery({
    startDate: startDateISO,
    endDate: endDateISO,
    users: usersMap
  });

  // Fetch turnos si el usuario está logeado
  const {
    data: filteredAssignments = {},
    isLoading: userShiftsLoading
  } = useGetUserShiftsQuery(
    {
      userId: currentUser?.uid || "",
      startDate: startDateISO,
      endDate: endDateISO,
      users: usersMap
    },
    { skip: !currentUser }
  );

  // Mutation hook para modificar turnos
  const [modifyShift] = useModifyShiftMutation();

  // Snackbar Handler
  const showSnackbar: UseScheduleContentResult["showSnackbar"] = (
    message,
    severity = "info"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose: UseScheduleContentResult["handleSnackbarClose"] = (
    event,
    reason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Auth State Effect
  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const combinedUserData: CurrentUser = {
              ...(firebaseUser as CurrentUser),
              ...userDocSnap.data(),
              uid: firebaseUser.uid,
            };
            setCurrentUser(combinedUserData);
          } else {
            console.warn(
              "User document not found in Firestore:",
              firebaseUser.uid
            );
            // Set el usuario actual con los datos de auth
            setCurrentUser(firebaseUser as CurrentUser);
            showSnackbar(
              "Perfil no encontrado. Funcionalidad limitada.",
              "warning"
            );
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setCurrentUser(firebaseUser as CurrentUser);
          showSnackbar("Error al cargar datos del perfil.", "error");
          setError("Error al cargar datos del perfil.");
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Generar turnos basados en el rango de fechas
  const generateShifts = (dateRange: Date[]) => {
    const shifts = [];
    for (const date of dateRange) {
      shifts.push({
        id: `${format(date, "yyyy-MM-dd")}_M`,
        date: format(date, "yyyy-MM-dd"),
        shift: "M" as "M",
        assignments: [],
      });
      shifts.push({
        id: `${format(date, "yyyy-MM-dd")}_T`,
        date: format(date, "yyyy-MM-dd"),
        shift: "T" as "T",
        assignments: [],
      });
    }
    return shifts;
  };

  const shifts = useMemo(() => generateShifts(dateRange), [dateRange]);

  // --- Shift Action Logic (Internal) ---
  const executeModifyShift = async (
    dateKey: string,
    shiftKey: "M" | "T",
    targetUserId: string,
    targetUserName: string, // Solo usado para mensajes UI, no para la BD
    targetUserRoles: number[] | undefined, // Solo usado para lógica local, no para la BD
    actionType: 'add' | 'remove'
  ) => {
    if (targetUserId === currentUser?.uid && (!currentUser?.name || !currentUser?.lastname)) {
      showSnackbar("Perfil incompleto (nombre/apellido).", "warning");
      return;
    }
    if (!currentUser || !currentUser.uid) {
      showSnackbar("Usuario no autenticado.", "warning");
      return;
    }

    const loadingIndicatorKey = `${dateKey}_${shiftKey}_${targetUserId}`;
    setIsUpdatingShift((prev) => ({ ...prev, [loadingIndicatorKey]: true }));
    setError(null);

    try {
      await modifyShift({
        dateKey,
        shiftKey,
        uid: targetUserId,
        name: '', // Ya no se usa en la BD
        action: actionType,
      }).unwrap();

      const formattedDate = format(parseISO(dateKey), "EEEE d 'de' MMMM", { locale: es });
      const shiftTimeName = shiftKey === "M" ? "mañana" : "tarde";
      
      if (actionType === "add") {
        showSnackbar(
          `${targetUserName} asignado al turno del ${formattedDate} por la ${shiftTimeName}.`,
          "success"
        );
      } else {
        showSnackbar(
          `${targetUserName} eliminado del turno del ${formattedDate} por la ${shiftTimeName}.`,
          "info"
        );
      }
    } catch (err) {
      console.error("Error updating shift:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error al actualizar turno: ${errorMessage}`);
      showSnackbar(`Error al actualizar el turno para ${targetUserName}.`, "error");
    } finally {
      setIsUpdatingShift((prev) => ({ ...prev, [loadingIndicatorKey]: false }));
    }
  };

  const renderLoadingScreen = () => {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Box
          sx={{
            width: 200,
            height: 200,
            position: "relative",
          }}
        >
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            sizes="200px"
            style={{ objectFit: "contain" }}
            priority
          />
        </Box>
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" color="primary">
          Cargando turnos...
        </Typography>
      </Box>
    );
  };

  const handleVolunteerClick = async (volunteer: ShiftAssignment) => {
    if (!currentUser) return;

    if (volunteer.phone) {
      setSelectedVolunteer(volunteer);
      setContactDialogOpen(true);
      return;
    }

    if (
      currentUser.roles &&
      currentUser.roles?.includes(UserRoles.RESPONSABLE) &&
      volunteer.uid !== currentUser.uid
    ) {
      const userFromCache = usersMap[volunteer.uid];
      if (userFromCache?.phone) {
        setSelectedVolunteer({
          ...volunteer,
          phone: userFromCache.phone,
        });
        setContactDialogOpen(true);
        return;
      }

      try {
        const volunteerDoc = await getDoc(doc(db, "users", volunteer.uid));
        if (volunteerDoc.exists()) {
          const volunteerData = volunteerDoc.data();
          setSelectedVolunteer({
            ...volunteer,
            phone: volunteerData.phone || "",
          });
          setContactDialogOpen(true);
        }
      } catch (error) {
        console.error("Error al obtener datos del voluntario:", error);
        showSnackbar("Error al obtener datos de contacto", "error");
      }
      return;
    }

    if (
      currentUser.roles?.includes(UserRoles.VOLUNTARIO) ||
      !currentUser.roles
    ) {
      try {
        const isInSameShift = Object.entries(processedAssignments).some(
          ([_, shifts]) => {
            return Object.values(shifts).some((assignments) => {
              const isUserInShift = assignments?.some(
                (a) => a.uid === currentUser.uid
              );
              const targetIsResponsible =
                volunteer.roles !== undefined
                  ? volunteer.roles.includes(UserRoles.RESPONSABLE)
                  : false;
              return isUserInShift && targetIsResponsible;
            });
          }
        );

        if (
          isInSameShift &&
          volunteer.roles &&
          volunteer.roles?.includes(UserRoles.RESPONSABLE)
        ) {
          const userFromCache = usersMap[volunteer.uid];
          if (userFromCache?.phone) {
            setSelectedVolunteer({
              ...volunteer,
              phone: userFromCache.phone,
            });
            setContactDialogOpen(true);
            return;
          }

          const responsableDoc = await getDoc(doc(db, "users", volunteer.uid));
          if (responsableDoc.exists()) {
            const responsableData = responsableDoc.data();
            setSelectedVolunteer({
              ...volunteer,
              phone: responsableData.phone || "",
            });
            setContactDialogOpen(true);
          }
        } else {
          showSnackbar(
            "Solo puedes contactar con el responsable de tu turno",
            "warning"
          );
        }
      } catch (error) {
        console.error("Error al obtener datos del responsable:", error);
        showSnackbar("Error al obtener datos de contacto", "error");
      }
    }
  };

  // Helper Functions
  const getShiftDisplayName = (shiftKey: "M" | "T"): string => {
    return shiftKey === "M" ? "Mañana" : "Tarde";
  };

  // Estado loading combinado
  const isLoading = authLoading || shiftsLoading || userShiftsLoading || usersLoading;

  const renderShiftAssignmentList = (dayKey: string, shiftKey: "M" | "T") => {
    const assignmentsToRender = processedAssignments[dayKey]?.[shiftKey];
    const isAdmin = currentUser?.roles?.includes(UserRoles.ADMINISTRADOR);

    const assignmentsList = assignmentsToRender ?? [];

    // Componente del botón de añadir usuario
    const AddUserButton = () => isAdmin ? (
      <Tooltip title="Añadir usuario a este turno" arrow>
        <Box
          onClick={() => handleAddUserButtonClick(dayKey, shiftKey)}
          sx={{
            borderRadius: "8px",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "grey.300",
            cursor: "pointer",
            transition: "all 0.2s ease",
            minHeight: '24px',
            minWidth: '24px',
            "&:hover": {
              backgroundColor: "grey.400",
              filter: "brightness(0.95)",
            },
          }}
        >
          <PersonAddIcon sx={{ color: "text.primary", fontSize: "1rem" }} />
        </Box>
      </Tooltip>
    ) : null;

    if (assignmentsList.length === 0) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Nadie asignado
            </Typography>
            {isAdmin && <AddUserButton />}
          </Box>
        </Box>
      );
    }
  
    const getRoleColor = (roles?: number[]) => {
      if (!roles) return "text.secondary";
      if (roles?.includes(UserRoles.RESPONSABLE)) return "success.main";
      return "primary.light";
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          {assignmentsList.map((assignment) => {
            const isCurrentUser = currentUser?.uid === assignment.uid;
            const roleColor = getRoleColor(assignment.roles);

            let canContact = false;
            if (!isCurrentUser && currentUser) {
              if (
                currentUser.roles &&
                (currentUser.roles.includes(UserRoles.RESPONSABLE) || currentUser.roles.includes(UserRoles.ADMINISTRADOR))
              ) {
                canContact = true;
              } else if (
                currentUser.roles?.includes(UserRoles.VOLUNTARIO) ||
                !currentUser.roles
              ) {
                const userInThisShift = (processedAssignments[dayKey]?.[shiftKey] ?? []).some(
                  (a) => a.uid === currentUser.uid
                );
                const targetIsResponsible = (assignment.roles ?? []).includes(
                  UserRoles.RESPONSABLE
                );
                canContact = userInThisShift && targetIsResponsible;
              }
            }

            const Content = (
              <Box
                sx={{
                  borderRadius: "8px",
                  padding: "2px 6px",
                  display: "flex",
                  alignItems: "center",
                  width: "fit-content",
                  backgroundColor: roleColor,
                  cursor: canContact ? "pointer" : "default",
                  transition: "all 0.2s ease",
                  "&:hover": canContact
                    ? { filter: "brightness(0.9)" }
                    : undefined,
                }}
              >
                <Typography
                  variant="caption"
                  onClick={() => 
                    canContact && (!isAdmin || (isAdmin && !isCurrentUser))
                      ? handleVolunteerClick(assignment)
                      : undefined
                  }
                  sx={{
                    color: "white",
                    fontWeight: isCurrentUser ? 600 : 400,
                    fontSize: "0.7rem",
                    userSelect: "none",
                    cursor: canContact ? 'pointer' : 'default',
                    ...(isAdmin && usersMap[assignment.uid]?.isEnabled === false && {
                      textDecoration: 'line-through',
                    }),
                  }}
                >
                  {assignment.name}
                  {isCurrentUser && " (Tú)"}
                </Typography>
                {isAdmin && !isCurrentUser && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUserClick(assignment, dayKey, shiftKey);
                    }}
                    sx={{
                      padding: "0px",
                      marginLeft: "4px",
                      color: "white",
                      opacity: 0.8, 
                      "&:hover": { opacity: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
                    }}
                    aria-label={`Eliminar a ${assignment.name} del turno`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
                  </IconButton>
                )}
              </Box>
            );

            return canContact && !isAdmin ? (
              <Tooltip key={assignment.uid} title="Clic para contactar" arrow>
                {Content}
              </Tooltip>
            ) : (
              <React.Fragment key={assignment.uid}>{Content}</React.Fragment>
            );
          })}

          {isAdmin && <AddUserButton />}
        </Box>
      </Box>
    );
  };

  // Manejo de errores
  useEffect(() => {
    if (shiftsError) {
      setError('Error al cargar los turnos');
      showSnackbar('Error al cargar los turnos', 'error');
    }
  }, [shiftsError]); 

  const myShiftsCount = useMemo(() => {
    if (!filteredAssignments) return 0;
    return Object.values(filteredAssignments).reduce((acc, day: any) => {
      const count = (day.M?.length || 0) + (day.T?.length || 0);
      return acc + count;
    }, 0);
  }, [filteredAssignments]);

  useEffect(() => {
    if (!authLoading && currentUser && !initialTabLogicApplied) {
      const hasInitiallyAssignedShifts = myShiftsCount > 0;
      setActiveTab(hasInitiallyAssignedShifts ? 1 : 0);
      setInitialTabLogicApplied(true);
    }
    // No quitar myShiftsCount de las dependencias, ya que es necesario para la lógica inicial correcta.
    // initialTabLogicApplied previene ejecuciones subsecuentes no deseadas.
  }, [authLoading, currentUser, myShiftsCount, initialTabLogicApplied]);


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const initiateShiftAction = async (dateKey: string, shiftKey: "M" | "T") => {
    if (authLoading || !currentUser || !currentUser.uid) {
      showSnackbar("Usuario no disponible o no autenticado.", "warning");
      return;
    }
    // Comprobar si el usuario tiene nombre y apellido
    if (!currentUser.name || !currentUser.lastname) {
      showSnackbar("Perfil incompleto (nombre/apellido).", "warning");
      return;
    }

    const currentShiftAssignments = processedAssignments[dateKey]?.[shiftKey] ?? [];
    const isUserAlreadyAssigned = currentShiftAssignments.some(
      (a) => a.uid === currentUser.uid
    );

    if (!isUserAlreadyAssigned && currentShiftAssignments.length >= 3) {
      setShiftToAction({ dateKey, shiftKey });
      setConfirmDialogOpen(true);
      return; 
    }
    
    // Si el usuario ya está asignado o hay espacio, proceder a modificar el turno
    await executeModifyShift(
      dateKey,
      shiftKey,
      currentUser.uid,
      `${currentUser.name} ${currentUser.lastname}`,
      currentUser.roles,
      isUserAlreadyAssigned ? 'remove' : 'add'
    );
  };

  const confirmShiftAction = async () => {
    if (shiftToAction && currentUser) {
      // Para la confirmación de auto-asignación
      await executeModifyShift(
        shiftToAction.dateKey,
        shiftToAction.shiftKey,
        currentUser.uid,
        `${currentUser.name} ${currentUser.lastname}`,
        currentUser.roles,
        'add'
      );
      setConfirmDialogOpen(false);
      setShiftToAction(null);
    }
  };

  const cancelShiftAction = () => {
    setConfirmDialogOpen(false);
    setShiftToAction(null);
  };

  // --- Manejadores de acción para el ADMIN ---
  const handleRemoveUserClick = (assignment: ShiftAssignment, dateKey: string, shiftKey: "M" | "T") => {
    setUserToRemoveDetails({ uid: assignment.uid, name: assignment.name || 'Usuario desconocido', dateKey, shiftKey });
    setRemoveUserConfirmOpen(true);
  };

  const confirmRemoveUser = async () => {
    if (userToRemoveDetails && currentUser?.roles?.includes(UserRoles.ADMINISTRADOR)) {
      const { uid, name, dateKey, shiftKey } = userToRemoveDetails;
      const userBeingRemoved = usersMap[uid];
      await executeModifyShift(dateKey, shiftKey, uid, name, userBeingRemoved?.roles, 'remove');
      setRemoveUserConfirmOpen(false);
      setUserToRemoveDetails(null);
    }
  };

  const cancelRemoveUser = () => {
    setRemoveUserConfirmOpen(false);
    setUserToRemoveDetails(null);
  };

  const handleAddUserButtonClick = (dateKey: string, shiftKey: "M" | "T") => {
    if (currentUser?.roles?.includes(UserRoles.ADMINISTRADOR)) {
      setShiftForUserAssignment({ dateKey, shiftKey });
      setAddUserDialogOpen(true);
    }
  };

  const confirmAddUserToShift = async (userId: string) => {
    if (shiftForUserAssignment && currentUser?.roles?.includes(UserRoles.ADMINISTRADOR)) {
      const userToAdd = usersMap[userId];
      if (!userToAdd) {
        showSnackbar("Usuario no encontrado.", "error");
        return;
      }
      const { dateKey, shiftKey } = shiftForUserAssignment;
      await executeModifyShift(
        dateKey,
        shiftKey,
        userId,
        `${userToAdd.name || ''} ${userToAdd.lastname || ''}`.trim() || 'Usuario sin nombre',
        userToAdd.roles,
        'add'
      );
    }
  };

  const cancelAddUser = () => {
    setAddUserDialogOpen(false);
    setShiftForUserAssignment(null);
  };

  return {
    processedAssignments,
    filteredAssignments,
    isUpdatingShift,
    isLoading,
    authLoading,
    currentUser,
    error,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    showSnackbar,
    handleSnackbarClose,
    shiftsTimeKeys: ["M", "T"],
    getShiftDisplayName,
    dateRange,
    endDate: safeEndDate,
    renderShiftAssignmentList,
    shifts,
    selectedVolunteer,
    contactDialogOpen,
    setContactDialogOpen,
    handleVolunteerClick,
    // New returned values
    activeTab,
    myShiftsCount,
    confirmDialogOpen,
    handleTabChange,
    initiateShiftAction,
    confirmShiftAction,
    cancelShiftAction,

    // Admin features
    removeUserConfirmOpen,
    setRemoveUserConfirmOpen,
    userToRemoveDetails,
    handleRemoveUserClick,
    confirmRemoveUser,
    cancelRemoveUser,
    addUserDialogOpen,
    setAddUserDialogOpen,
    shiftForUserAssignment,
    handleAddUserButtonClick,
    confirmAddUserToShift,
    cancelAddUser,
    renderLoadingScreen,
    allUsersList,
  };
}