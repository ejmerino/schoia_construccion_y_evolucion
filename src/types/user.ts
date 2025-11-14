

// Using a serializable object for Timestamps to avoid issues between server/client components
interface SerializableTimestamp {
    seconds: number;
    nanoseconds: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  role?: 'Superadmin' | 'Admin' | 'Estudiante';
  createdAt?: SerializableTimestamp | Date; // Allow both for flexibility
  lastUniversityId?: string;
  lastCareerId?: string;
  // Add other fields from your user document here
}
