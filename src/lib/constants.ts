// Niveles de roles de usuario
export const UserRoles = {
  VOLUNTARIO: 1,
  RESPONSABLE: 2,
  ADMINISTRADOR: 3,
} as const;

// Mapeo de niveles a nombres de roles
export const RoleNames = {
  [UserRoles.VOLUNTARIO]: 'voluntario',
  [UserRoles.RESPONSABLE]: 'responsable',
  [UserRoles.ADMINISTRADOR]: 'administrador',
} as const;

// Mapeo inverso de nombres a niveles
export const RoleLevels = {
  voluntario: UserRoles.VOLUNTARIO,
  responsable: UserRoles.RESPONSABLE,
  administrador: UserRoles.ADMINISTRADOR,
} as const;

// Función para obtener el nombre del rol a partir del nivel
export function getRoleName(level: number): string {
  return RoleNames[level as keyof typeof RoleNames] || 'voluntario';
}

// Función para obtener el nivel a partir del nombre del rol
export function getRoleLevel(name: string): string {
  return name.toLowerCase();
}

// Función para verificar si un usuario tiene al menos cierto nivel de rol
export function hasRoleLevel(userRoles: number[], requiredLevel: number): boolean {
  return userRoles.some(role => role >= requiredLevel);
}