import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, eachDayOfInterval, addDays, startOfDay } from "date-fns";
import { UserRoles } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ShiftAssignment } from "@/store/api/shiftsApi";
import { CurrentUser, User } from '@/types/common';
import { ProcessedAssignments } from './useShiftsData';


export interface ScheduleUI {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: "success" | "error" | "info" | "warning";
  showSnackbar: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
  handleSnackbarClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
  selectedVolunteer: ShiftAssignment | null;
  contactDialogOpen: boolean;
  setContactDialogOpen: (open: boolean) => void;
  handleVolunteerClick: (volunteer: ShiftAssignment) => Promise<void>;
  activeTab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  initialTabLogicApplied: boolean;
  setInitialTabLogicApplied: React.Dispatch<React.SetStateAction<boolean>>;
  visibleDaysCount: number;
  isLoadingMoreDays: boolean;
  allDaysToDisplay: Date[];
  daysToDisplay: Date[];
  shouldLoadMoreDays: () => boolean;
  shouldShowLoader: boolean;
  dateRange: Date[];
  safeEndDate: Date;
}

interface UseScheduleUIProps {
  startDate: Date;
  endDate?: Date;
  currentUser: CurrentUser | null;
  usersMap: { [uid: string]: User };
  processedAssignments: ProcessedAssignments;
  myShiftsCount: number; // Necesario para la lógica inicial de la pestaña
  authLoading: boolean; // Necesario para la lógica inicial de la pestaña
}

export function useScheduleUI({
  startDate,
  endDate,
  currentUser,
  usersMap,
  processedAssignments,
  myShiftsCount,
  authLoading,
}: UseScheduleUIProps): ScheduleUI {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  const [selectedVolunteer, setSelectedVolunteer] = useState<ShiftAssignment | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [initialTabLogicApplied, setInitialTabLogicApplied] = useState(false);

  const [visibleDaysCount, setVisibleDaysCount] = useState(7); // Días iniciales a mostrar
  const [isLoadingMoreDays, setIsLoadingMoreDays] = useState(false);

  const safeEndDate = useMemo(() => 
    endDate && !isNaN(endDate.getTime()) ? endDate : addDays(startDate, 6)
  , [startDate, endDate]);

  const dateRange = useMemo(() => 
    eachDayOfInterval({ start: startDate, end: safeEndDate })
  , [startDate, safeEndDate]);

  const allDaysToDisplay = useMemo(() => {
    const start = startOfDay(startDate);
    const end = startOfDay(safeEndDate);
    return eachDayOfInterval({ start, end });
  }, [startDate, safeEndDate]);

  const daysToDisplay = useMemo(() => {
    return allDaysToDisplay.slice(0, visibleDaysCount);
  }, [allDaysToDisplay, visibleDaysCount]);

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleVolunteerClick = async (volunteer: ShiftAssignment) => {
    if (!currentUser) return;

    if (volunteer.phone) {
      setSelectedVolunteer(volunteer);
      setContactDialogOpen(true);
      return;
    }

    const canAdminOrResponsableContact = currentUser.roles?.includes(UserRoles.RESPONSABLE) || currentUser.roles?.includes(UserRoles.ADMINISTRADOR);

    if (canAdminOrResponsableContact && volunteer.uid !== currentUser.uid) {
      const userFromCache = usersMap[volunteer.uid];
      if (userFromCache?.phone) {
        setSelectedVolunteer({ ...volunteer, phone: userFromCache.phone });
        setContactDialogOpen(true);
        return;
      }
      try {
        const volunteerDoc = await getDoc(doc(db, "users", volunteer.uid));
        if (volunteerDoc.exists()) {
          const volunteerData = volunteerDoc.data();
          setSelectedVolunteer({ ...volunteer, phone: volunteerData.phone || "" });
          setContactDialogOpen(true);
        } else {
          showSnackbar("No se encontró información de contacto.", "warning");
        }
      } catch (error) {
        console.error("Error al obtener datos del voluntario:", error);
        showSnackbar("Error al obtener datos de contacto", "error");
      }
      return;
    }

    // Lógica para voluntario contactando a responsable en el mismo turno
    const isVoluntario = currentUser.roles?.includes(UserRoles.VOLUNTARIO) || !currentUser.roles;
    if (isVoluntario) {
        const targetIsResponsibleInAnyOfUserShifts = Object.values(processedAssignments).some(dayShifts => 
            Object.values(dayShifts).some(shiftAssignments => 
                shiftAssignments &&
                shiftAssignments.some(a => a.uid === currentUser.uid) && // Current user is in this shift
                shiftAssignments.some(a => a.uid === volunteer.uid && a.roles?.includes(UserRoles.RESPONSABLE)) // Target volunteer is a responsable in this same shift
            )
        );

      if (targetIsResponsibleInAnyOfUserShifts) {
        const userFromCache = usersMap[volunteer.uid];
        if (userFromCache?.phone) {
          setSelectedVolunteer({ ...volunteer, phone: userFromCache.phone });
          setContactDialogOpen(true);
          return;
        }
        try {
          const responsableDoc = await getDoc(doc(db, "users", volunteer.uid));
          if (responsableDoc.exists()) {
            const responsableData = responsableDoc.data();
            setSelectedVolunteer({ ...volunteer, phone: responsableData.phone || "" });
            setContactDialogOpen(true);
          }
        } catch (error) {
          console.error("Error al obtener datos del responsable:", error);
          showSnackbar("Error al obtener datos de contacto", "error");
        }
      } else {
        showSnackbar("Solo puedes contactar con el responsable de tu turno.", "warning");
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Efecto para la carga infinita
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMoreDays || !shouldLoadMoreDays()) return;
      
      const scrollPosition = window.innerHeight + window.scrollY;
      const bodyHeight = document.body.offsetHeight;
      const scrollThreshold = bodyHeight - 100; // Umbral un poco antes del final
              
      if (scrollPosition >= scrollThreshold) {
        setIsLoadingMoreDays(true);
        setTimeout(() => {
          setVisibleDaysCount(prev => Math.min(prev + 7, allDaysToDisplay.length));
          setIsLoadingMoreDays(false);
        }, 500);
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMoreDays, allDaysToDisplay.length, visibleDaysCount]);

  const shouldLoadMoreDays = useCallback(() => {
    if (visibleDaysCount >= allDaysToDisplay.length) return false;
    if (activeTab === 0) return true;
    if (activeTab === 1 && currentUser) {
      for (let i = visibleDaysCount; i < allDaysToDisplay.length; i++) {
        const date = allDaysToDisplay[i];
        const dateKey = format(date, "yyyy-MM-dd");
        const dayAssignments = processedAssignments[dateKey];
        if (dayAssignments) {
          const hasMorningShift = dayAssignments.M?.some(a => a.uid === currentUser.uid) ?? false;
          const hasAfternoonShift = dayAssignments.T?.some(a => a.uid === currentUser.uid) ?? false;
          if (hasMorningShift || hasAfternoonShift) return true;
        }
      }
      return false;
    }
    return false;
  }, [visibleDaysCount, allDaysToDisplay, activeTab, currentUser, processedAssignments]);

  const shouldShowLoader = useMemo(() => {
    return isLoadingMoreDays || (shouldLoadMoreDays() && visibleDaysCount < allDaysToDisplay.length);
  }, [isLoadingMoreDays, shouldLoadMoreDays, visibleDaysCount, allDaysToDisplay.length]);

  // Efecto para la lógica de la pestaña inicial
   useEffect(() => {
    if (!authLoading && currentUser && !initialTabLogicApplied) {
      const hasInitiallyAssignedShifts = myShiftsCount > 0;
      setActiveTab(hasInitiallyAssignedShifts ? 1 : 0);
      setInitialTabLogicApplied(true);
    }
  }, [authLoading, currentUser, myShiftsCount, initialTabLogicApplied, setInitialTabLogicApplied]);


  return {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    showSnackbar,
    handleSnackbarClose,
    selectedVolunteer,
    contactDialogOpen,
    setContactDialogOpen,
    handleVolunteerClick,
    activeTab,
    handleTabChange,
    initialTabLogicApplied, 
    setInitialTabLogicApplied,
    visibleDaysCount,
    isLoadingMoreDays,
    allDaysToDisplay,
    daysToDisplay,
    shouldLoadMoreDays,
    shouldShowLoader,
    dateRange,
    safeEndDate,
  };
}
