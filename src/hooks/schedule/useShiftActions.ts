import { useState } from 'react';
import { useModifyShiftMutation, ShiftAssignment } from "@/store/api/shiftsApi";
import { UserRoles } from "@/lib/constants";
import { CurrentUser, User } from '@/types/common';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProcessedAssignments } from './useShiftsData'; // Importar desde el hook de datos

export interface ShiftActions {
  isUpdatingShift: { [key: string]: boolean };
  confirmDialogOpen: boolean;
  shiftToAction: { dateKey: string; shiftKey: "M" | "T" } | null;
  removeUserConfirmOpen: boolean;
  userToRemoveDetails: { uid: string; name: string; dateKey: string; shiftKey: "M" | "T" } | null;
  addUserDialogOpen: boolean;
  shiftForUserAssignment: { dateKey: string; shiftKey: "M" | "T" } | null;
  executeModifyShift: (
    dateKey: string,
    shiftKey: "M" | "T",
    targetUserId: string,
    targetUserName: string,
    actionType?: 'add' | 'remove'
  ) => Promise<void>;
  initiateShiftAction: (dateKey: string, shiftKey: "M" | "T") => Promise<void>;
  confirmShiftAction: () => Promise<void>;
  cancelShiftAction: () => void;
  handleRemoveUserClick: (assignment: ShiftAssignment, dateKey: string, shiftKey: "M" | "T") => void;
  confirmRemoveUser: () => Promise<void>;
  cancelRemoveUser: () => void;
  handleAddUserButtonClick: (dateKey: string, shiftKey: "M" | "T") => void;
  confirmAddUserToShift: (userId: string) => Promise<void>;
  cancelAddUser: () => void;
  setIsUpdatingShift: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

interface UseShiftActionsProps {
  currentUser: CurrentUser | null;
  usersMap: { [uid: string]: User };
  processedAssignments: ProcessedAssignments;
  showSnackbar: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
  authLoading: boolean;
}

export function useShiftActions({
  currentUser,
  usersMap,
  processedAssignments,
  showSnackbar,
  authLoading,
}: UseShiftActionsProps): ShiftActions {
  const [modifyShift] = useModifyShiftMutation();
  const [isUpdatingShift, setIsUpdatingShift] = useState<{ [key: string]: boolean }>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [shiftToAction, setShiftToAction] = useState<{ dateKey: string; shiftKey: "M" | "T" } | null>(null);
  const [removeUserConfirmOpen, setRemoveUserConfirmOpen] = useState(false);
  const [userToRemoveDetails, setUserToRemoveDetails] = useState<{ uid: string; name: string; dateKey: string; shiftKey: "M" | "T" } | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [shiftForUserAssignment, setShiftForUserAssignment] = useState<{ dateKey: string; shiftKey: "M" | "T" } | null>(null);

  const executeModifyShift = async (
    dateKey: string,
    shiftKey: "M" | "T",
    targetUserId: string,
    targetUserName: string,
    actionType: 'add' | 'remove' = 'add'
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

    try {
      await modifyShift({
        dateKey,
        shiftKey,
        uid: targetUserId,
        name: '',
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
      showSnackbar(`Error al actualizar el turno para ${targetUserName}: ${errorMessage}`, "error");
    } finally {
      setIsUpdatingShift((prev) => ({ ...prev, [loadingIndicatorKey]: false }));
    }
  };

  const initiateShiftAction = async (dateKey: string, shiftKey: "M" | "T") => {
    if (authLoading || !currentUser || !currentUser.uid) {
      showSnackbar("Usuario no disponible o no autenticado.", "warning");
      return;
    }
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
    
    await executeModifyShift(
      dateKey,
      shiftKey,
      currentUser.uid,
      `${currentUser.name} ${currentUser.lastname}`,
      isUserAlreadyAssigned ? 'remove' : 'add'
    );
  };

  const confirmShiftAction = async () => {
    if (shiftToAction && currentUser) {
      await executeModifyShift(
        shiftToAction.dateKey,
        shiftToAction.shiftKey,
        currentUser.uid,
        `${currentUser.name} ${currentUser.lastname}`,
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

  const handleRemoveUserClick = (assignment: ShiftAssignment, dateKey: string, shiftKey: "M" | "T") => {
    setUserToRemoveDetails({ uid: assignment.uid, name: assignment.name || 'Usuario desconocido', dateKey, shiftKey });
    setRemoveUserConfirmOpen(true);
  };

  const confirmRemoveUser = async () => {
    if (userToRemoveDetails && currentUser?.roles?.includes(UserRoles.ADMINISTRADOR)) {
      const { uid, name, dateKey, shiftKey } = userToRemoveDetails;
      await executeModifyShift(dateKey, shiftKey, uid, name, 'remove');
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
        'add'
      );
      // Cerrar el diálogo después de la acción, independientemente del resultado de executeModifyShift
      setAddUserDialogOpen(false);
      setShiftForUserAssignment(null);
    }
  };

  const cancelAddUser = () => {
    setAddUserDialogOpen(false);
    setShiftForUserAssignment(null);
  };

  return {
    isUpdatingShift,
    confirmDialogOpen,
    shiftToAction,
    removeUserConfirmOpen,
    userToRemoveDetails,
    addUserDialogOpen,
    shiftForUserAssignment,
    executeModifyShift,
    initiateShiftAction,
    confirmShiftAction,
    cancelShiftAction,
    handleRemoveUserClick,
    confirmRemoveUser,
    cancelRemoveUser,
    handleAddUserButtonClick,
    confirmAddUserToShift,
    cancelAddUser,
    setIsUpdatingShift,
  };
}
