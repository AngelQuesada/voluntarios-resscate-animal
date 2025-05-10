// Este archivo contendrá tipos e interfaces comunes utilizados en toda la aplicación.

/**
 * Representa la estructura de datos de un usuario en Firestore y en la aplicación.
 */
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
