"use client";

import React, { useState, Suspense, lazy } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Container,
  Tooltip,
  TablePagination,
  Tabs,
  Tab,
  CircularProgress,
  Switch,
  FormControlLabel,
  Backdrop
} from "@mui/material";
import { Header } from "@/components/schedule/header";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import HistoryIcon from "@mui/icons-material/History";
import PeopleIcon from "@mui/icons-material/People";
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useAdminPanel } from "@/hooks/use-admin-panel";
import NotificationSnackbar from "../schedule/NotificationSnackbar";
import { UserRoles, getRoleName } from "@/lib/constants";
import DialogComponent from "./DialogComponent";
import UserDetailDialog from "./UserDetailDialog";
import ContactDialog from "../schedule/ContactDialog";
import UserForm from "./UserForm";
import SearchInput from "./SearchInput";
import WeekViewPanel from "./WeekViewPanel";
import { useIsMobile } from "@/hooks/use-mobile";

// Importar el componente de historial lazy
const HistoryCalendar = lazy(() => import('../history/HistoryCalendar'));

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
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useIsMobile();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const {
    loading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    newUserInfo,
    setNewUserInfo,
    formError,
    deleteError,
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddingUser,
    setIsEditDialogOpen,
    editUserInfo,
    setEditUserInfo,
    handleInputChange,
    handleAddUser,
    openDeleteDialog,
    closeDeleteDialog,
    openEditDialog,
    handleEditInputChange,
    handleEditUser,
    handleDeleteUser,
    contactDialogOpen,
    selectedUser,
    userDetailDialogOpen,
    detailUser,
    page,
    rowsPerPage,
    searchTerm,
    showSearchInput,
    handleSearchIconClick,
    handleClickAwaySearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenContactDialog,
    handleCloseContactDialog,
    handleOpenUserDetailDialog,
    handleCloseUserDetailDialog,
    handleSearchChange,
    filteredUsers,
    prioritizeResponsables,
    handlePrioritizeResponsablesChange,
    handleEnabledSwitchChange,
    handleEditEnabledSwitchChange,
  } = useAdminPanel();


  const UsersTable = () => (
    <>
      {/* Fila para el botón Añadir Usuario */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Añadir Voluntario
        </Button>
      </Box>

      {/* Fila para la búsqueda y el interruptor de priorizar responsables */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexWrap: isMobile ? "nowrap" : "wrap",
          gap: 1,
          mb: 2
        }}
      >
        {isMobile && (
          <FormControlLabel
            control={<Switch checked={prioritizeResponsables} onChange={handlePrioritizeResponsablesChange} />}
            label="Solo Responsables"
            sx={{ mb: 1 }}
          />
        )}
        <SearchInput 
          searchTerm={searchTerm}
          showSearchInput={isMobile ? true : showSearchInput}
          handleSearchChange={handleSearchChange}
          handleSearchIconClick={handleSearchIconClick}
          handleClickAwaySearch={isMobile ? undefined : handleClickAwaySearch}
          isMobile={isMobile}
        />
        {!isMobile && (
          <FormControlLabel
            control={<Switch checked={prioritizeResponsables} onChange={handlePrioritizeResponsablesChange} />}
            label="Solo Responsables"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre Completo</TableCell>
                <TableCell align="center">Contactar</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          height: "24px",
                          width: "70%",
                          bgcolor: "rgba(0, 0, 0, 0.08)",
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          height: "24px",
                          width: "50%",
                          bgcolor: "rgba(0, 0, 0, 0.08)",
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          height: "24px",
                          width: "40%",
                          bgcolor: "rgba(0, 0, 0, 0.08)",
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No hay usuarios que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={user.uid}
                      sx={{
                        opacity: user.isEnabled === false ? 0.5 : 1,
                        '& .MuiTableCell-root': {
                          color: user.isEnabled === false ? 'text.disabled' : 'text.primary',
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="body1"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                                color: 'primary.main'
                              },
                              mr: 0.5
                            }}
                            onClick={() => handleOpenUserDetailDialog(user)}
                          >
                            {`${user.name} ${user.lastname}`}
                          </Typography>
                          {Array.isArray(user.roles) && user.roles.includes(UserRoles.ADMINISTRADOR) && (
                            <Tooltip title={getRoleName(UserRoles.ADMINISTRADOR)} arrow>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: 'red',
                                  ml: 0.5
                                }}
                              />
                            </Tooltip>
                          )}
                          {Array.isArray(user.roles) && user.roles.includes(UserRoles.RESPONSABLE) && (
                            <Tooltip title={getRoleName(UserRoles.RESPONSABLE)} arrow>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: 'green',
                                  ml: 0.5
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenContactDialog(user)}
                          title={`Contactar a ${user.name}`}
                        >
                          <ContactPhoneIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label="edit user"
                          color="primary"
                          onClick={() => openEditDialog(user)}
                          sx={{ p: 0, mr: 0.5 }}
                        >
                          <EditIcon fontSize="medium" />
                        </IconButton>
                        <IconButton
                          aria-label="delete user"
                          color="error"
                          onClick={() => openDeleteDialog(user)}
                          sx={{ p: 0 }}
                        >
                          <DeleteIcon fontSize="medium" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[12, 24, 48]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Usuarios por página:"
        />
      </Paper>
    </>
  );

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Panel de Administración
          </Typography>
          
          {/* Sistema de pestañas */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="panel de administración tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab 
              icon={<PeopleIcon />} 
              label="Usuarios" 
              iconPosition="start"
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<HistoryIcon />} 
              label="Historial" 
              iconPosition="start"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab 
              icon={<DateRangeIcon />} 
              label="Semana" 
              iconPosition="start"
              id="tab-2"
              aria-controls="tabpanel-2"
            />
          </Tabs>

          {/* Contenido de las pestañas */}
          <TabPanel value={activeTab} index={0}>
            <UsersTable />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            }>
              {activeTab === 1 && <HistoryCalendar />}
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            }>
              {activeTab === 2 && <WeekViewPanel onUserClick={handleOpenUserDetailDialog} />}
            </Suspense>
          </TabPanel>
        </Box>

        {/* Diálogos y notificaciones */}
        {contactDialogOpen && selectedUser && (
          <ContactDialog
            open={contactDialogOpen}
            onClose={handleCloseContactDialog}
            user={selectedUser}
          />
        )}

        <DialogComponent
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          title="Añadir Nuevo Usuario"
          content={
            <UserForm
              userData={newUserInfo}
              handleChange={handleInputChange}
              setUserData={setNewUserInfo}
              isAddMode={true}
              handleEnabledSwitchChange={handleEnabledSwitchChange}
            />
          }
          error={formError}
          actions={[
            { label: "Cancelar", onClick: () => setIsAddDialogOpen(false) },
            {
              label: "Añadir",
              onClick: handleAddUser,
              variant: "contained",
              color: "primary"
            }
          ]}
        />

        <DialogComponent
                  open={isEditDialogOpen}
                  onClose={() => setIsEditDialogOpen(false)}
                  title="Editar Usuario"
                  content={
                    <UserForm
                      userData={editUserInfo}
                      handleChange={handleEditInputChange}
                      setUserData={setEditUserInfo}
                      isAddMode={false}
                      handleEnabledSwitchChange={handleEditEnabledSwitchChange}
                    />
                  }
                  error={formError}
                  actions={[
                    { 
                      label: "Cancelar", 
                      onClick: () => setIsEditDialogOpen(false),
                      disabled: isAddingUser
                    },
                    {
                      label: "Guardar Cambios",
                      onClick: handleEditUser,
                      variant: "contained",
                      color: "primary",
                      disabled: isAddingUser
                    }
                  ]}
                />

        <DialogComponent
          open={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          title="¿Eliminar usuario?"
          contentText="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este usuario?"
          error={deleteError}
          actions={[
            { label: "Cancelar", onClick: closeDeleteDialog },
            {
              label: "Eliminar",
              onClick: handleDeleteUser,
              color: "error",
              autoFocus: true
            }
          ]}
        />

        <NotificationSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          severity="info"
          onClose={() => setSnackbarOpen(false)}
        />

        <UserDetailDialog
          open={userDetailDialogOpen}
          onClose={handleCloseUserDetailDialog}
          user={detailUser}
        />

        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
          open={isAddingUser}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

      </Container>
    </>
  );
}