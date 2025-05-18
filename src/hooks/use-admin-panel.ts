import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User } from '../types/common';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { UserRoles } from "@/lib/constants";

// Función para validar formato de número de teléfono español
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+34|0034)?[ -]*(6|7|8|9)[ -]*([0-9][ -]*){8}$/;
  return phoneRegex.test(phone);
};

interface EditUserInfoState {
  username: string;
  roles: number[];
  name: string;
  lastname: string;
  birthdate: string;
  email: string;
  phone: string;
  job: string;
  location: string;
  isEnabled: boolean;
}

interface NewUserInfoState {
  username: string;
  roles: number[];
  name: string;
  lastname: string;
  birthdate: string;
  email: string;
  phone: string;
  job: string;
  location: string;
  password: string;
  passwordConfirm?: string;
  isEnabled: boolean;
}

export const useAdminPanel = () => {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [newUserInfo, setNewUserInfo] = useState<NewUserInfoState>({
    username: '',
    roles: [], 
    name: '',
    lastname: '',
    birthdate: '',
    email: '',
    phone: '',
    job: '',
    location: '',
    password: '',
    isEnabled: true,
  });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  
  const [editUserInfo, setEditUserInfo] = useState<EditUserInfoState>({
    username: '',
    roles: [],
    name: '',
    lastname: '',
    birthdate: '',
    email: '',
    phone: '',
    job: '',
    location: '',
    isEnabled: true,
  });

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [prioritizeResponsables, setPrioritizeResponsables] = useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState(searchTerm);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        uid: doc.id,
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setFormError('Error al cargar los usuarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePrioritizeResponsablesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrioritizeResponsables(event.target.checked);
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleEnabledSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserInfo(prev => ({
      ...prev,
      isEnabled: event.target.checked,
    }));
  };

  const handleEditEnabledSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditUserInfo(prev => ({
      ...prev,
      isEnabled: event.target.checked,
    }));
  };

  const handleAddUser = async () => {
    setFormError(null);
    if (
      !newUserInfo.username ||
      !newUserInfo.name ||
      !newUserInfo.lastname ||
      !newUserInfo.email ||
      !newUserInfo.phone ||
      !newUserInfo.password
    ) {
      setFormError(
        'Por favor, rellena todos los campos obligatorios, incluida la contraseña.'
      );
      return;
    }

    // Validar que las contraseñas coinciden
    if (newUserInfo.password !== newUserInfo.passwordConfirm) {
      setFormError('Las contraseñas no coinciden. Por favor, verifica ambas contraseñas.');
      return;
    }

    // Validar longitud mínima de contraseña
    if (newUserInfo.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Validar formato de número de teléfono
    if (!isValidPhone(newUserInfo.phone)) {
      setFormError('El formato del número de teléfono no es válido. Asegúrate de usar un número español válido.');
      return;
    }

    setIsAddingUser(true);

    let finalRoles = [...(newUserInfo.roles || [])];
    if (!finalRoles.includes(UserRoles.VOLUNTARIO)) {
      finalRoles.push(UserRoles.VOLUNTARIO);
    }

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...newUserInfo, 
          roles: finalRoles,
          role: finalRoles[0] || UserRoles.VOLUNTARIO
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al crear usuario: ${response.status} ${response.statusText}`);
      }

      const { uid } = await response.json();
      const user = { uid };

      const userDataForFirestore = {
        uid: user.uid,
        username: newUserInfo.username,
        role: finalRoles[0] || UserRoles.VOLUNTARIO,
        roles: finalRoles,
        name: newUserInfo.name,
        lastname: newUserInfo.lastname,
        birthdate: newUserInfo.birthdate,
        email: newUserInfo.email,
        phone: newUserInfo.phone,
        job: newUserInfo.job,
        location: newUserInfo.location,
        createdAt: new Date().toISOString(),
        isEnabled: newUserInfo.isEnabled,
      };

      await setDoc(doc(db, 'users', user.uid), userDataForFirestore);

      setNewUserInfo({
        username: '',
        roles: [UserRoles.VOLUNTARIO],
        name: '',
        lastname: '',
        birthdate: '',
        email: '',
        phone: '',
        job: '',
        location: '',
        password: '',
        isEnabled: true,
      });

      setIsAddDialogOpen(false);

      fetchUsers();
      setSnackbarMessage('Usuario creado correctamente');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error adding user:', error);
      if (error.code === 'auth/email-already-in-use') {
        setFormError('El correo electrónico ya está en uso.');
      } else if (error.code === 'auth/weak-password') {
        setFormError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setFormError('Error al crear el usuario. Verifica la consola.');
      }
    } finally {
      setIsAddingUser(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const closeDeleteDialog = () => {
    setUserToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (user: User) => {
    setUserToEdit(user);
    // Asegurarse de que 'roles' sea siempre un array
    const currentRoles = Array.isArray(user.roles) ? user.roles : (user.roles ? [user.roles] : []);

    setEditUserInfo({
      username: user.username || '',
      roles: currentRoles,
      name: user.name || '',
      lastname: user.lastname || '',
      birthdate: user.birthdate || '',
      email: user.email || '',
      phone: user.phone || '',
      job: user.job || '',
      location: user.location || '',
      isEnabled: user.isEnabled !== false,
    });
    setIsEditDialogOpen(true);
    setFormError(null);
  };

  const handleEditUser = async () => {
    setFormError(null);
    if (!userToEdit) return;

    if (
      !editUserInfo.username ||
      !editUserInfo.name ||
      !editUserInfo.lastname ||
      !editUserInfo.email ||
      !editUserInfo.phone
    ) {
      setFormError('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    // Validar formato de número de teléfono
    if (!isValidPhone(editUserInfo.phone)) {
      setFormError('El formato del número de teléfono no es válido. Asegúrate de usar un número español válido.');
      return;
    }

    // Usar los roles seleccionados directamente
    const finalRoles = editUserInfo.roles;

    try {
      const userRef = doc(db, 'users', userToEdit.uid);
      // Actualizar solo los campos necesarios en Firestore
      await updateDoc(userRef, {
        username: editUserInfo.username,
        roles: finalRoles,
        name: editUserInfo.name,
        lastname: editUserInfo.lastname,
        birthdate: editUserInfo.birthdate,
        email: editUserInfo.email,
        phone: editUserInfo.phone,
        job: editUserInfo.job,
        location: editUserInfo.location,
        isEnabled: editUserInfo.isEnabled,
      });

      setIsEditDialogOpen(false);
      setUserToEdit(null);
      fetchUsers();
      setSnackbarMessage('Usuario actualizado correctamente');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating user:', error);
      setFormError('Error al actualizar el usuario. Verifica la consola.');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteError(null);
    setIsDeletingUser(true);

    try {
      // 1. Llamar a la API para eliminar el usuario de Firebase Auth
      const response = await fetch(`/api/users/${userToDelete.uid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error al eliminar usuario de Auth: ${response.status}`);
      }

      // 2. Eliminar el documento del usuario de Firestore
      await deleteDoc(doc(db, 'users', userToDelete.uid));

      closeDeleteDialog();
      fetchUsers();
      setSnackbarMessage('Usuario eliminado correctamente');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setDeleteError(error.message || 'Error al eliminar el usuario. Verifica la consola.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleSearchIconClick = () => {
    setShowSearchInput(true);
  };

  const handleClickAwaySearch = () => {
    setShowSearchInput(false);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenContactDialog = (user: User) => {
    setSelectedUser(user);
    setContactDialogOpen(true);
  };

  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenUserDetailDialog = (user: User) => {
    setDetailUser(user);
    setUserDetailDialogOpen(true);
  };

  const handleCloseUserDetailDialog = () => {
    setUserDetailDialogOpen(false);
    setDetailUser(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchTerm(searchTerm);
      setPage(0);
    }, 300); // Tiempo debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const getRoleName = (level: number): string => {
    const roleMap: { [key: number]: string } = {
      [UserRoles.VOLUNTARIO]: 'Voluntario',
      [UserRoles.RESPONSABLE]: 'Responsable',
      [UserRoles.ADMINISTRADOR]: 'Administrador',
    };
    return roleMap[level] || 'Desconocido';
  };

  const filteredUsers = useMemo(() => {
    let usersToProcess = [...users];

    // Primero, filtrar por el término de búsqueda
    let searchedUsers = usersToProcess.filter(user =>
      `${user.name} ${user.lastname} ${user.username} ${user.email || ''} ${(Array.isArray(user.roles) ? user.roles.map(r => getRoleName(r)).join(' ') : getRoleName(user.roles || UserRoles.VOLUNTARIO))}`
      .toLowerCase()
      .includes(debounceSearchTerm.toLowerCase())
    );

    // Luego, ordenar según los criterios:
    // 1. Priorizar Responsables (si está activo)
    // 2. Estado de habilitación (habilitados primero)
    // 3. Nombre completo
    searchedUsers.sort((a, b) => {
      // Priorizar Responsables
      if (prioritizeResponsables) {
        const aIsResponsable = Array.isArray(a.roles) ? a.roles.includes(UserRoles.RESPONSABLE) : a.roles === UserRoles.RESPONSABLE;
        const bIsResponsable = Array.isArray(b.roles) ? b.roles.includes(UserRoles.RESPONSABLE) : b.roles === UserRoles.RESPONSABLE;
        if (aIsResponsable && !bIsResponsable) return -1;
        if (!aIsResponsable && bIsResponsable) return 1;
      }

      // Ordenar por isEnabled (true primero)
      const aIsEnabled = a.isEnabled !== false;
      const bIsEnabled = b.isEnabled !== false;
      if (aIsEnabled && !bIsEnabled) return -1;
      if (!aIsEnabled && bIsEnabled) return 1;

      // Finalmente, ordenar por nombre completo
      return `${a.name} ${a.lastname}`.localeCompare(`${b.name} ${b.lastname}`);
    });

    return searchedUsers;
  }, [users, debounceSearchTerm, prioritizeResponsables]);

  return {
    users,
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
    setContactDialogOpen,
    selectedUser,
    setSelectedUser,
    userDetailDialogOpen,
    setUserDetailDialogOpen,
    detailUser,
    setDetailUser,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    searchTerm,
    setSearchTerm,
    showSearchInput,
    setShowSearchInput,
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
    isAddingUser,
    isDeletingUser,
  };
};