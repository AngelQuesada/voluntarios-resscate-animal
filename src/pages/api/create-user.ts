import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import { UserRoles } from '@/lib/constants';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, role = UserRoles.VOLUNTARIO, roles = [], ...userData } = req.body;

    // Asegurarse de que el usuario tenga al menos el rol de Voluntario
    let finalRoles = Array.isArray(roles) ? [...roles] : [];
    if (!finalRoles.includes(UserRoles.VOLUNTARIO)) {
      finalRoles.push(UserRoles.VOLUNTARIO);
    }

    // Usar el primer rol o Voluntario como rol principal (para compatibilidad)
    const mainRole = finalRoles[0] || UserRoles.VOLUNTARIO;

    // Crear usuario en Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${userData.name} ${userData.lastname}`,
    });

    // Asignar claims basados en los roles
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: mainRole,
      roles: finalRoles,
    });

    return res.status(200).json({ uid: userRecord.uid });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      error: error.message || 'Error creating user',
      code: error.code,
    });
  }
}