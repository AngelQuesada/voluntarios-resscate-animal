import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { UserRoles } from "@/lib/constants";
import { AddUserToShiftDialogProps, User } from "./types";

const AddUserToShiftDialog: React.FC<AddUserToShiftDialogProps> = ({
  open,
  onClose,
  onAddUser,
  users,
  currentAssignments,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const alreadyAssignedIds = new Set(currentAssignments.map(a => a.uid));

  const filteredUsers = users
    .filter(user => 
      !alreadyAssignedIds.has(user.id) &&
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const getHighestRole = (user: User) => {
        if (!user.roles || user.roles.length === 0) return UserRoles.VOLUNTARIO;
        return Math.max(...user.roles);
      };
      
      const roleA = getHighestRole(a);
      const roleB = getHighestRole(b);
      
      // Ordenar por jerarquía de rol (más alto primero)
      if (roleA !== roleB) return roleB - roleA;
      
      // Si los roles son iguales, ordenar alfabéticamente
      return `${a.name} ${a.lastname}`.localeCompare(`${b.name} ${b.lastname}`);
    });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Añadir Usuario al Turno</DialogTitle>
      <DialogContent sx={{ paddingTop: '8px !important' }}>
        <TextField
          autoFocus
          margin="dense"
          label="Buscar usuario..."
          type="search"
          fullWidth
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        {filteredUsers.length > 0 ? (
          <List dense>
            {filteredUsers.map((user) => (
              <ListItem
                key={user.id}
                divider
                sx={{ paddingLeft: 0, paddingRight: 0 }}
              >
                <ListItemText
                  primary={
                    user.roles?.includes(UserRoles.RESPONSABLE) ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {`${user.name || ""} ${user.lastname || ""}`.trim() || "Usuario sin nombre"}
                        <FiberManualRecordIcon sx={{ color: 'green', fontSize: '0.8rem', ml: 0.5 }} />
                      </Box>
                    ) : (
                      `${user.name || ""} ${user.lastname || ""}`.trim() || "Usuario sin nombre"
                    )
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="assign shift"
                    onClick={() => {
                      onAddUser(user.id);
                      onClose();
                    }}
                    color="primary"
                  >
                    <AddCircleOutline />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            No hay usuarios disponibles para añadir o que coincidan con la búsqueda.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserToShiftDialog;
