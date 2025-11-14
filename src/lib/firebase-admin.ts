
import * as admin from 'firebase-admin';

// These variables are automatically set by the Firebase environment
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const ADMIN_APP_NAME = 'firebase-frameworks';
const adminApp =
  admin.apps.find((it) => it.name === ADMIN_APP_NAME) ||
  admin.initializeApp(
    {
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    },
    ADMIN_APP_NAME
  );

export function getAdminApp() {
    return adminApp;
}

export function getAdminAuth() {
    return adminApp.auth();
}
