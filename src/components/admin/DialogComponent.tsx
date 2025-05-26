import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode; // Changed from content to children
  contentText?: string;
  error?: string | null;
  actions: {
    label: string;
    onClick: () => void;
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    variant?: "text" | "outlined" | "contained";
    autoFocus?: boolean;
    disabled?: boolean;
  }[];
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

const DialogComponent: React.FC<DialogComponentProps> = ({
  open,
  onClose,
  title,
  children, // Changed from content to children
  contentText,
  error,
  actions,
  maxWidth = "sm",
  fullWidth = true,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <DialogTitle id="dialog-title">{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {contentText && (
          <DialogContentText id="dialog-description">
            {contentText}
          </DialogContentText>
        )}
        {children} {/* Changed from content to children */}
      </DialogContent>
      <DialogActions>
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            color={action.color || "primary"}
            variant={action.variant || "text"}
            autoFocus={action.autoFocus}
          >
            {action.label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default DialogComponent;