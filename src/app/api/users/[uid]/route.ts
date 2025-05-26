import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebaseAdmin';

interface RequestContext {
  params: {
    uid: string;
  }
}

// Modificamos la estructura para ser compatible con Next.js App Router
export async function GET(
  request: Request,
  { params }: RequestContext
) {
  try {
    const userRef = doc(db, 'users', params.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(userSnap.data());
  } catch (error: any) {
    console.error('Error al obtener el usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener el usuario', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RequestContext
) {
  try {
    const { newPassword } = await request.json();
    const { uid } = params;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña no cumple los requisitos mínimos', message: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    initAdmin(); // Asegurar que Firebase Admin esté inicializado

    await getAuth().updateUser(uid, {
      password: newPassword,
    });

    return NextResponse.json(
      { success: true, message: 'Contraseña actualizada correctamente' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al actualizar la contraseña:', error);

    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'Usuario no encontrado', message: 'El usuario no existe en Firebase Authentication.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar la contraseña', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RequestContext
) {
  try {
    initAdmin();

    await getAuth().deleteUser(params.uid);

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario eliminado correctamente' 
    });
  } catch (error: any) {
    console.error('Error al eliminar el usuario:', error);
    
    // Verificar si el error es porque el usuario no existe
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'Usuario no encontrado', message: 'El usuario no existe en Firebase Authentication' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al eliminar el usuario', message: error.message },
      { status: 500 }
    );
  }
}