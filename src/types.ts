// Interfaces comunes del proyecto

export interface User {
  id: string;
  username: string;
  roles: number[];
  name: string;
  lastname: string;
  birthdate: string;
  email: string;
  phone: string;
  job?: string;
  location?: string;
}

export interface HeaderProps {
  userRoles: string[];
}