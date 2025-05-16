import { useMemo } from 'react';
import { useGetShiftsQuery, useGetUserShiftsQuery, type ShiftAssignment } from "@/store/api/shiftsApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { CurrentUser, User} from '@/types/common';

export interface ProcessedAssignments {
  [dateKey: string]: {
    M?: ShiftAssignment[];
    T?: ShiftAssignment[];
  };
}

export interface ShiftsData {
  processedAssignments: ProcessedAssignments;
  filteredAssignments: ProcessedAssignments;
  usersMap: { [uid: string]: User };
  allUsersList: { id: string; name?: string; lastname?: string; roles?: number[] }[];
  shiftsLoading: boolean;
  userShiftsLoading: boolean;
  usersLoading: boolean;
  shiftsError: any; // Considerar un tipo más específico si es posible
  myShiftsCount: number;
}

interface UseShiftsDataProps {
  startDateISO: string;
  endDateISO: string;
  currentUser: CurrentUser | null;
}

export function useShiftsData({
  startDateISO,
  endDateISO,
  currentUser,
}: UseShiftsDataProps): ShiftsData {
  const { 
    data: usersMap = {}, 
    isLoading: usersLoading 
  } = useGetUsersQuery();

  const allUsersList = useMemo(() => {
    return Object.entries(usersMap).map(([uid, user]) => ({
      id: uid,
      name: user.name,
      lastname: user.lastname,
      roles: user.roles,
    }));
  }, [usersMap]);

  const {
    data: processedAssignments = {},
    isLoading: shiftsLoading,
    error: shiftsError,
  } = useGetShiftsQuery({
    startDate: startDateISO,
    endDate: endDateISO,
    users: usersMap,
  });

  const {
    data: filteredAssignments = {},
    isLoading: userShiftsLoading,
  } = useGetUserShiftsQuery(
    {
      userId: currentUser?.uid || "",
      startDate: startDateISO,
      endDate: endDateISO,
      users: usersMap,
    },
    { skip: !currentUser }
  );

  const myShiftsCount = useMemo(() => {
    if (!filteredAssignments) return 0;
    return Object.values(filteredAssignments).reduce((acc, day: any) => {
      const count = (day.M?.length || 0) + (day.T?.length || 0);
      return acc + count;
    }, 0);
  }, [filteredAssignments]);

  return {
    processedAssignments,
    filteredAssignments,
    usersMap,
    allUsersList,
    shiftsLoading,
    userShiftsLoading,
    usersLoading,
    shiftsError,
    myShiftsCount,
  };
}
