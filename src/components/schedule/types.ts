// Este archivo contendrá las interfaces y tipos específicos del módulo de schedule.

import { AlertColor } from "@mui/material";

export interface ConfirmAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

export interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    name: string;
    phone: string;
  } | null;
}

export interface ConfirmRemoveUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export interface User {
  id: string;
  name?: string;
  lastname?: string;
  roles?: number[];
  isEnabled?: boolean;
}

export interface AddUserToShiftDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (userId: string) => void;
  users: User[];
  currentAssignments: { uid: string; name: string }[];
}