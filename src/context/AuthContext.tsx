
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  recheckUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  recheckUserProfile: async () => {},
});

// Helper function to ensure user profile exists
async function ensureUserProfile(firebaseUser: User): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserProfile;
        if (profileData.createdAt && profileData.createdAt instanceof Timestamp) {
            profileData.createdAt = profileData.createdAt.toDate();
        }
        return profileData;
    } else {
        // This case is for a user that is authenticated but has been deleted from the DB
        return null;
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] =useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleUserSession = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const profile = await ensureUserProfile(firebaseUser);
      if (profile) {
        setUser(firebaseUser);
        setUserProfile(profile);
      } else {
        // User is authenticated but doesn't have a profile (was deleted)
        await signOut(auth); // Force sign out
        setUser(null);
        setUserProfile(null);
        toast({
          variant: 'destructive',
          title: 'Cuenta no encontrada',
          description: 'Tu perfil de usuario ha sido eliminado. Por favor, contacta al administrador.',
        });
      }
    } else {
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
  }, [toast]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUserSession);
    return () => unsubscribe();
  }, [handleUserSession]);

  const recheckUserProfile = useCallback(async () => {
    if (auth.currentUser) {
      const profile = await ensureUserProfile(auth.currentUser);
      setUserProfile(profile);
    }
  }, []);

  const value = { user, userProfile, loading, recheckUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
