// Este archivo contendrá tipos e interfaces comunes utilizados en toda la aplicación.

/**
 * Representa la estructura de datos de un usuario en Firestore y en la aplicación.
 */
export interface User {
  id?: string; // ID de Firestore (opcional, puede ser el uid)
  uid: string; // ID de Firebase Authentication
  username: string;
  roles: number[]; // Cambiado de string a number para usar niveles numéricos
  name: string;
  lastname: string;
  birthdate: string; // Considerar usar tipo Date o timestamp
  email: string;
  phone: string;
  job?: string; // Opcional
  location?: string; // Opcional
  createdAt: string; // Considerar usar tipo Date o timestamp
}
