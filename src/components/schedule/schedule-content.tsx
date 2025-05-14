"use client";

import React, { useMemo } from "react";
import { format, eachDayOfInterval, isValid, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ScheduleContentProps } from "@/app/schedule/page";
import { useScheduleContent } from "@/hooks/use-schedule-content";
import TableContainer from "@mui/material/TableContainer";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import CircularProgress from "@mui/material/CircularProgress";
import TableBody from "@mui/material/TableBody";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CircleIcon from "@mui/icons-material/Circle";
import { Badge } from "@mui/material";
import ConfirmAssignmentDialog from "./ConfirmAssignmentDialog";
import NotificationSnackbar from "./NotificationSnackbar";
import ContactDialog from "./ContactDialog";
import { useTheme } from "@mui/material/styles";
import ConfirmRemoveUserDialog from "./ConfirmRemoveUserDialog";
import AddUserToShiftDialog from "./AddUserToShiftDialog";

export default function ScheduleContent({
  startDate,
  endDate,
}: ScheduleContentProps) {
  const theme = useTheme();

  // Memoizar el rango de fechas para evitar recálculos innecesarios
  const daysToDisplay = useMemo(() => {
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    return eachDayOfInterval({ start, end });
  }, [startDate, endDate]);

  const {
    authLoading,
    currentUser,
    error,
    handleSnackbarClose,
    isUpdatingShift,
    processedAssignments,
    snackbarMessage,
    snackbarOpen,
    snackbarSeverity,
    renderShiftAssignmentList,
    getShiftDisplayName,
    isLoading,
    selectedVolunteer,
    contactDialogOpen,
    setContactDialogOpen,
    activeTab,
    myShiftsCount,
    confirmDialogOpen,
    handleTabChange,
    initiateShiftAction,
    confirmShiftAction,
    cancelShiftAction,
    removeUserConfirmOpen,
    cancelRemoveUser,
    confirmRemoveUser,
    userToRemoveDetails,
    addUserDialogOpen,
    cancelAddUser,
    confirmAddUserToShift,
    allUsersList,
    shiftForUserAssignment,
    renderLoadingScreen,
  } = useScheduleContent({
    startDate: daysToDisplay[0],
    endDate: daysToDisplay[daysToDisplay.length - 1],
  });

  const renderScheduleTable = () => {
    if (!isValid(endDate)) {
      return <Alert severity="error">Fechas de inicio o fin inválidas.</Alert>;
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {daysToDisplay.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const dayOfWeek = format(date, "EEEE", { locale: es });
          const formattedDate = format(date, "d MMM.", { locale: es });
          const dayKeyDisplay =
            dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

          let dayHasAssignmentsInMyTurnos = true;
          if (activeTab === 1 && currentUser) {
            const dayAssignments = processedAssignments[dateKey];
            if (!dayAssignments) {
              dayHasAssignmentsInMyTurnos = false;
            } else {
              dayHasAssignmentsInMyTurnos =
                (dayAssignments.M?.some((a) => a.uid === currentUser.uid) ?? false) ||
                (dayAssignments.T?.some((a) => a.uid === currentUser.uid) ?? false);
            }
          }

          if (activeTab === 1 && !dayHasAssignmentsInMyTurnos) {
            return null;
          }

          return (
            <TableContainer
              key={dateKey}
              component={Paper}
              elevation={2}
              sx={{
                mb: 2,
                "&:last-child": {
                  mb: 0,
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      sx={{
                        fontWeight: "bold",
                        textAlign: "left",
                        py: 2,
                        backgroundColor: "primary.main",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: "bold",
                          }}
                        >
                          {dayKeyDisplay} {formattedDate}
                        </Typography>
                        {activeTab === 0 &&
                          (() => {
                            const conditions = (["M", "T"] as const).map(
                              (shiftKey) => {
                                const shiftAssignments =
                                  processedAssignments[dateKey]?.[shiftKey] ?? [];
                                const hasResponsable = shiftAssignments.some(
                                  (a: any) =>
                                    Array.isArray(a.roles) &&
                                    a.roles.includes(2)
                                );
                                const hasEnoughVolunteers =
                                  shiftAssignments.length >= 3;
                                const isValid =
                                  hasResponsable && hasEnoughVolunteers;

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const shiftDate = new Date(dateKey);
                                const daysDifference = Math.floor(
                                  (shiftDate.getTime() - today.getTime()) / 
                                  (1000 * 60 * 60 * 24)
                                );
                                const isWithinNextThreeDays =
                                  daysDifference >= 0 && daysDifference <= 3;

                                return { isValid, isWithinNextThreeDays };
                              }
                            );

                            const showWarningIcon = conditions.some(
                              (c) => c.isWithinNextThreeDays && !c.isValid
                            );
                            const showCheckIcon = conditions.every(
                              (c) => c.isValid
                            ) && conditions.length > 0;


                            if (showWarningIcon) {
                              return (
                                <ErrorIcon
                                  sx={{
                                    color: theme.palette.primary.contrastText,
                                    fontSize: "1.5rem",
                                  }}
                                />
                              );
                            } else if (showCheckIcon) {
                              return (
                                <CheckCircleIcon
                                  sx={{
                                    color: theme.palette.primary.contrastText,
                                    fontSize: "1.5rem",
                                  }}
                                />
                              );
                            }
                            return null;
                          })()}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(["M", "T"] as const).map((shiftKey) => {
                    const shiftDisplayName = getShiftDisplayName(shiftKey);
                    const currentShiftAssignments = processedAssignments[dateKey]?.[shiftKey] ?? [];
                    const isCurrentUserAssigned = currentShiftAssignments.some(
                      (a: any) => a.uid === currentUser?.uid
                    );

                    if (activeTab === 1 && !isCurrentUserAssigned) {
                      return null;
                    }

                    let isLoadingThisShift = false;
                    if (currentUser && currentUser.uid) {
                      const keyForSelfAction = `${dateKey}_${shiftKey}_${currentUser.uid}`;
                      isLoadingThisShift = isUpdatingShift[keyForSelfAction] ?? false;
                    }

                    const hasResponsable = currentShiftAssignments.some(
                      (a: any) => Array.isArray(a.roles) && a.roles.includes(2)
                    );
                    const hasEnoughVolunteers =
                      currentShiftAssignments.length >= 3;
                    const showValidationTick =
                      hasResponsable && hasEnoughVolunteers;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const shiftDate = new Date(dateKey);
                    const daysDifference = Math.floor(
                      (shiftDate.getTime() - today.getTime()) / 
                      (1000 * 60 * 60 * 24)
                    );
                    const isWithinNextTwoDays =
                      daysDifference >= 0 && daysDifference <= 2;

                    return (
                      <TableRow key={`${dateKey}-${shiftKey}`} hover>
                        <TableCell // Columna (Mañana/Tarde)
                          sx={{
                            verticalAlign: "middle",
                            width: "80px",
                            padding: "8px 12px",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              minHeight: "24px",
                            }}
                          >
                            {showValidationTick ? (
                              <CheckCircleIcon
                                sx={{
                                  color: "success.main",
                                  fontSize: "1.2rem",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              />
                            ) : isWithinNextTwoDays ? (
                              <ErrorIcon
                                sx={{
                                  color: "warning.main",
                                  fontSize: "1.2rem",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              />
                            ) : (
                              <CircleIcon
                                sx={{
                                  color: "action.disabled",
                                  fontSize: "1.2rem",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              color="primary"
                              sx={{
                                minWidth: "60px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {shiftDisplayName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell // Columna para el botón de acción
                          sx={{
                            verticalAlign: "middle",
                            width: "1px",
                            padding: "8px 8px 8px 0px",
                            whiteSpace: "nowrap", 
                          }}
                        >
                          {authLoading ? (
                            <HourglassEmptyIcon color="disabled" />
                          ) : currentUser ? (
                            <IconButton
                              onClick={() =>
                                initiateShiftAction(
                                  dateKey,
                                  shiftKey
                                )
                              }
                              color={
                                isCurrentUserAssigned ? "error" : "primary"
                              }
                              size="small"
                              disabled={isLoadingThisShift}
                              sx={{
                                "&.MuiIconButton-root": {
                                  backgroundColor: isCurrentUserAssigned
                                    ? theme.palette.error.light
                                    : theme.palette.primary.main,
                                  color: theme.palette.primary.contrastText,
                                  borderRadius: "6px",
                                  width: "28px",
                                  height: "28px",
                                  "&:hover": {
                                    backgroundColor: isCurrentUserAssigned
                                      ? theme.palette.error.dark
                                      : theme.palette.primary.dark,
                                  },
                                  "&:disabled": {
                                    backgroundColor:
                                      "action.disabledBackground",
                                    color: "action.disabled",
                                  },
                                },
                              }}
                            >
                              {isLoadingThisShift ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : isCurrentUserAssigned ? (
                                <DeleteIcon fontSize="small" />
                              ) : (
                                <PersonAddIcon fontSize="small" />
                              )}
                            </IconButton>
                          ) : (
                            <BlockIcon color="disabled" />
                          )}
                        </TableCell>
                        <TableCell // Column for User Assignments
                          sx={{ verticalAlign: "middle", padding: "8px 12px" }}
                        >
                          {renderShiftAssignmentList(dateKey, shiftKey)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          );
        })}
      </Box>
    );
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (authLoading || isLoading) {
    return renderLoadingScreen();
  }

  return (
    <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
      <Box sx={{ maxWidth: "800px", width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
          >
            <Tab label="Todos los turnos" />
            <Tab
              label={
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  Mis turnos
                  {myShiftsCount > 0 && (
                    <Badge
                      badgeContent={myShiftsCount}
                      color="primary"
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Box>
        {renderScheduleTable()}
      </Box>
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
      {/* Admin: Confirmar borrar usuario Dialog */}
      <ConfirmRemoveUserDialog
        open={removeUserConfirmOpen}
        onClose={cancelRemoveUser}
        onConfirm={confirmRemoveUser}
        userName={userToRemoveDetails?.name}
      />
      {/* Admin: Añadir usuario al turno Dialog */}
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