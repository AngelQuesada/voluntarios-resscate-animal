import { User as FirebaseUser } from "firebase/auth";

export interface User {
  id?: string;
  uid: string;
  username: string;
  roles: number[];
  name: string;
  lastname: string;
  birthdate: string;
  email: string;
  phone: string;
  job?: string;
  location?: string;
  createdAt: string;
  isEnabled?: boolean; 
}

export interface CurrentUser extends Omit<FirebaseUser, "providerData"> {
  providerData?: any[];
  email: string;
  uid: string;
  name?: string;
  lastname?: string;
  roles?: number[];
  phone?: string;
  isEnabled: boolean;
}

export interface HeaderProps {
  userRoles: string[];
}

