import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { ConfirmRemoveUserDialogProps } from "./types";

const ConfirmRemoveUserDialog: React.FC<ConfirmRemoveUserDialogProps> = ({
  open,
  onClose,
  onConfirm,
  userName,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {userName
            ? `¿Estás seguro de que quieres eliminar a ${userName} de este turno?`
            : "¿Estás seguro de que quieres eliminar a este usuario de este turno?"}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmRemoveUserDialog;
