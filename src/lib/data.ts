
'use server';

import { collection, getDocs, query, orderBy, doc, getDoc, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CareerInfo, University } from '@/types';
import type { UserProfile } from '@/types/user';


export async function getUniversities(): Promise<University[]> {
  try {
    const universitiesRef = collection(db, 'universidades');
    const q = query(universitiesRef, orderBy('nombre'));
    const querySnapshot = await getDocs(q);
    const universities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as University));
    return universities;
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    return [];
  }
}

export async function getUniversity(universityId: string): Promise<University | null> {
    try {
        const universityRef = doc(db, 'universidades', universityId);
        const docSnap = await getDoc(universityRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as University;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch university:", error);
        return null;
    }
}


export async function getCareers(universityId: string): Promise<(CareerInfo & { id: string })[]> {
  try {
    const careersRef = collection(db, 'universidades', universityId, 'carreras');
    const q = query(careersRef, orderBy('nombre'));
    const querySnapshot = await getDocs(q);
    const careers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().nombre || 'Carrera sin nombre',
      logo: doc.data().logo,
    }));
    return careers;
  } catch (error) {
    console.error("Failed to fetch careers:", error);
    return [];
  }
}

export async function getStats() {
    let universityCount = 0;
    let careerCount = 0;
    let subjectCount = 0;

    try {
        const universitiesRef = collection(db, 'universidades');
        const universitiesSnapshot = await getDocs(universitiesRef);
        universityCount = universitiesSnapshot.size;

        for (const universityDoc of universitiesSnapshot.docs) {
            const careersRef = collection(db, 'universidades', universityDoc.id, 'carreras');
            const careersSnapshot = await getDocs(careersRef);
            careerCount += careersSnapshot.size;

            for (const careerDoc of careersSnapshot.docs) {
                const subjectsRef = collection(db, 'universidades', universityDoc.id, 'carreras', careerDoc.id, 'materias');
                const subjectsSnapshot = await getDocs(subjectsRef);
                subjectCount += subjectsSnapshot.size;
            }
        }
        return { universityCount, careerCount, subjectCount };
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return { universityCount, careerCount, subjectCount };
    }
}

export async function getUserCount(): Promise<number> {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        return snapshot.size;
    } catch (error) {
        console.error("Failed to fetch user count:", error);
        return 0;
    }
}

export async function getRecentUsers(count: number = 5): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure createdAt is a serializable format (e.g., ISO string or timestamp seconds)
      const createdAt = data.createdAt instanceof Timestamp 
          ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } 
          : null;
      return {
        uid: doc.id,
        ...data,
        createdAt: createdAt
      } as UserProfile
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch recent users:", error);
    return [];
  }
}

export async function getSubjectDifficultyStats() {
    const stats: Record<string, number> = { facil: 0, media: 0, dificil: 0 };
    try {
        const universitiesSnapshot = await getDocs(collection(db, 'universidades'));
        for (const universityDoc of universitiesSnapshot.docs) {
            const careersSnapshot = await getDocs(collection(universityDoc.ref, 'carreras'));
            for (const careerDoc of careersSnapshot.docs) {
                const subjectsSnapshot = await getDocs(collection(careerDoc.ref, 'materias'));
                subjectsSnapshot.forEach(subjectDoc => {
                    const difficulty = subjectDoc.data().dificultad;
                    if (difficulty && stats.hasOwnProperty(difficulty)) {
                        stats[difficulty as 'facil' | 'media' | 'dificil']++;
                    }
                });
            }
        }
        return [
            { name: 'Fácil', count: stats.facil, fill: 'hsl(140, 50%, 60%)' },
            { name: 'Media', count: stats.media, fill: 'hsl(48, 80%, 60%)' },
            { name: 'Difícil', count: stats.dificil, fill: 'hsl(0, 70%, 60%)' },
        ];
    } catch (error) {
        console.error("Failed to fetch subject difficulty stats:", error);
        return [
            { name: 'Fácil', count: 0, fill: 'hsl(140, 50%, 60%)' },
            { name: 'Media', count: 0, fill: 'hsl(48, 80%, 60%)' },
            { name: 'Difícil', count: 0, fill: 'hsl(0, 70%, 60%)' },
        ];
    }
}
