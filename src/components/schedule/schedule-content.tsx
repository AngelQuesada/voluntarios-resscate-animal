"use client";

import React from "react";
import { format, isValid } from "date-fns";
import { ScheduleContentProps } from "@/app/schedule/page";
import { useScheduleContent } from "@/hooks/use-schedule-content";
import { Box, Alert } from "@mui/material";
import ConfirmAssignmentDialog from "./ConfirmAssignmentDialog";
import NotificationSnackbar from "./NotificationSnackbar";
import ContactDialog from "./ContactDialog";
import ConfirmRemoveUserDialog from "./ConfirmRemoveUserDialog";
import AddUserToShiftDialog from "./AddUserToShiftDialog";
import ScheduleTabsComponent from "./ScheduleTabsComponent";
import LoadingScreen from "./LoadingScreen";
import DayScheduleCard from "./DayScheduleCard";
import InfiniteScrollLoader from "./InfiniteScrollLoader";

export default function ScheduleContent({
  startDate,
  endDate,
}: ScheduleContentProps) {
  const {
    // Auth
    currentUser,
    authError,

    // Shifts Data
    processedAssignments,
    allUsersList,
    shiftsError,
    myShiftsCount,
    usersMap,

    // Shift Actions
    isUpdatingShift,
    confirmDialogOpen,
    removeUserConfirmOpen,
    userToRemoveDetails,
    addUserDialogOpen,
    shiftForUserAssignment,
    initiateShiftAction,
    confirmShiftAction,
    cancelShiftAction,
    handleRemoveUserClick,
    confirmRemoveUser,
    cancelRemoveUser,
    handleAddUserButtonClick,
    confirmAddUserToShift,
    cancelAddUser,

    // UI
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
    selectedVolunteer,
    contactDialogOpen,
    setContactDialogOpen,
    handleVolunteerClick,
    activeTab,
    handleTabChange,
    daysToDisplay,
    shouldShowLoader,

    // Helpers
    isContentLoading,
    getShiftDisplayName,
  } = useScheduleContent({
    startDate,
    endDate,
  });

  // Manejo de errores
  if (authError || shiftsError) {
    return <Alert severity="error">{authError || "Error al cargar los turnos"}</Alert>;
  }

  // Pantalla de carga
  if (isContentLoading) {
    return <LoadingScreen />;
  }

  // Validación de fecha
  if (!isValid(endDate)) {
    return <Alert severity="error">Fechas de inicio o fin inválidas.</Alert>;
  }

  return (
    <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
      <Box sx={{ maxWidth: "800px", width: "100%" }}>
        {/* Pestañas de navegación */}
        <ScheduleTabsComponent 
          activeTab={activeTab}
          myShiftsCount={myShiftsCount}
          handleTabChange={handleTabChange}
        />

        {/* Listado de días */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {daysToDisplay.map((date) => {
            const dateKey = format(date, "yyyy-MM-dd");
            
            // Filtrar días en "Mis turnos" que no tienen asignaciones del usuario
            if (activeTab === 1 && currentUser) {
              const dayAssignments = processedAssignments[dateKey];
              const userHasShiftsThisDay = dayAssignments 
                ? (dayAssignments.M?.some(a => a.uid === currentUser.uid) || 
                   dayAssignments.T?.some(a => a.uid === currentUser.uid))
                : false;
                
              if (!userHasShiftsThisDay) {
                return null;
              }
            }

            return (
              <DayScheduleCard
                key={dateKey}
                date={date}
                dayKey={dateKey}
                currentUser={currentUser}
                processedAssignments={processedAssignments}
                usersMap={usersMap}
                isUpdatingShift={isUpdatingShift}
                initiateShiftAction={initiateShiftAction}
                getShiftDisplayName={getShiftDisplayName}
                handleAddUserButtonClick={handleAddUserButtonClick}
                handleRemoveUserClick={handleRemoveUserClick}
                handleVolunteerClick={handleVolunteerClick}
              />
            );
          })}
        </Box>

        {/* Indicador de carga infinita */}
        <InfiniteScrollLoader isVisible={shouldShowLoader} />
      </Box>

      {/* Diálogos */}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
      />
      
      <ConfirmAssignmentDialog
        open={confirmDialogOpen}
        onClose={cancelShiftAction}
        onConfirm={confirmShiftAction}
        isLoading={Object.values(isUpdatingShift).some(Boolean)}
      />
      
      <ConfirmRemoveUserDialog
        open={removeUserConfirmOpen}
        onClose={cancelRemoveUser}
        onConfirm={confirmRemoveUser}
        userName={userToRemoveDetails?.name}
      />
      
      <AddUserToShiftDialog
        open={addUserDialogOpen}
        onClose={cancelAddUser}
        onAddUser={confirmAddUserToShift}
        users={allUsersList}
        currentAssignments={
          shiftForUserAssignment && processedAssignments[shiftForUserAssignment.dateKey]?.[shiftForUserAssignment.shiftKey]
            ? (processedAssignments[shiftForUserAssignment.dateKey]![shiftForUserAssignment.shiftKey]! as { uid: string; name: string }[])
            : []
        }
      />
      
      <ContactDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        user={
          selectedVolunteer
            ? {
              name: selectedVolunteer.name || "Desconocido",
              phone: selectedVolunteer.phone || "",
            }
            : null
        }
      />
    </Box>
  );
}