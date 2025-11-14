'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InboxClient } from './inbox-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AdminAuthGuard } from '@/app/admin/admin-auth-guard';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContactSubmission } from '@/types';

async function fetchSubmissionsFromClient(): Promise<{ submissions: ContactSubmission[], error?: string }> {
  try {
    const submissionsRef = collection(db, 'contactSubmissions');
    const q = query(submissionsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Firestore Timestamps need to be converted to JS Dates for serialization
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        return {
            id: doc.id,
            ...data,
            createdAt: createdAt,
        } as ContactSubmission;
    });
    return { submissions };
  } catch (error: any) {
    console.error("Failed to fetch contact submissions:", error);
    if (error.code === 'permission-denied') {
        return { submissions: [], error: 'No tienes permisos para ver esta información. Asegúrate de haber iniciado sesión con una cuenta de Admin o Superadmin.' };
    }
    return { submissions: [], error: 'No se pudieron cargar los mensajes.' };
  }
}

export default function InboxPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      const { submissions: fetchedSubmissions, error: fetchError } = await fetchSubmissionsFromClient();
      if (fetchError) {
        setError(fetchError);
      } else {
        setSubmissions(fetchedSubmissions);
      }
      setIsLoading(false);
    }
    
    loadSubmissions();
  }, []);

  return (
    <AdminAuthGuard>
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <InboxClient initialSubmissions={submissions} />
      )}
    </AdminAuthGuard>
  );
}
