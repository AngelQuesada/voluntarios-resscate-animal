import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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