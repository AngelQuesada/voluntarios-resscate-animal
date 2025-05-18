import React from 'react';
import { ShiftAssignment } from "@/store/api/shiftsApi";
import { CurrentUser, User } from "@/types/common";
import { ProcessedAssignments } from "@/hooks/schedule/useShiftsData";

export interface NotificationSnackbarProps {
  open: boolean;
  message: React.ReactNode;
  severity?: "success" | "error" | "info" | "warning";
  onClose?: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}

export interface DayScheduleCardProps {
  date: Date;
  dayKey: string;
  currentUser: CurrentUser | null;
  processedAssignments: ProcessedAssignments;
  usersMap: { [uid: string]: User };
  isUpdatingShift: { [key: string]: boolean };
  initiateShiftAction: (dateKey: string, shiftKey: "M" | "T") => Promise<void>;
  getShiftDisplayName: (shiftKey: "M" | "T") => string;
  handleAddUserButtonClick: (dateKey: string, shiftKey: "M" | "T") => void;
  handleRemoveUserClick: (
    assignment: ShiftAssignment,
    dateKey: string,
    shiftKey: "M" | "T"
  ) => void;
  handleVolunteerClick: (volunteer: ShiftAssignment) => Promise<void>;
}

export interface ShiftRowProps {
  dayKey: string;
  shiftKey: "M" | "T";
  shiftDisplayName: string;
  assignments: ShiftAssignment[];
  currentUser: CurrentUser | null;
  usersMap: { [uid: string]: User };
  isUpdatingShift: { [key: string]: boolean };
  initiateShiftAction: (dateKey: string, shiftKey: "M" | "T") => Promise<void>;
  handleAddUserButtonClick: (dateKey: string, shiftKey: "M" | "T") => void;
  handleRemoveUserClick: (
    assignment: ShiftAssignment,
    dateKey: string,
    shiftKey: "M" | "T"
  ) => void;
  handleVolunteerClick: (volunteer: ShiftAssignment) => Promise<void>;
}

export interface AddUserToShiftDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (userId: string) => void;
  users: Array<{ id: string; name?: string; lastname?: string; roles?: number[] }>;
  currentAssignments: Array<{ uid: string; name: string }>;
}

export interface ConfirmAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export interface ConfirmRemoveUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  isLoading?: boolean;
}

export interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  user: { name: string; phone: string } | null;
}

export interface ScheduleTabsComponentProps {
  activeTab: number;
  myShiftsCount: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}