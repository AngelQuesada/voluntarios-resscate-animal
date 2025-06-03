import { getAdminAuth, getAdminFirestore } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to delete a collection in batches
async function deleteCollection(db: admin.firestore.Firestore, collectionPath: string, batchSize: number) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db: admin.firestore.Firestore, query: admin.firestore.Query, resolve: () => void) {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    return resolve();
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const auth = getAdminAuth();
    const db = getAdminFirestore();

    // Delete all Firebase users
    let usersResult = await auth.listUsers();
    for (const userRecord of usersResult.users) {
      await auth.deleteUser(userRecord.uid);
    }
    // Handle pagination for users
    while (usersResult.pageToken) {
      usersResult = await auth.listUsers(1000, usersResult.pageToken);
      for (const userRecord of usersResult.users) {
        await auth.deleteUser(userRecord.uid);
      }
    }
    console.log('Successfully deleted all Firebase Auth users.');

    // Clear Firestore collections
    const collectionsToClear = ['users', 'shifts']; // Add other collections as needed
    const batchSize = 100; // Adjust batch size as needed

    for (const collectionPath of collectionsToClear) {
      console.log(`Clearing collection: ${collectionPath}`);
      await deleteCollection(db, collectionPath, batchSize);
      console.log(`Successfully cleared collection: ${collectionPath}`);
    }

    return NextResponse.json({ message: 'Test database prepared successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error preparing test database:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error preparing test database', error: errorMessage }, { status: 500 });
  }
}
