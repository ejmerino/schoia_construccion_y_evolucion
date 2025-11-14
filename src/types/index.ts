
export type CourseStatus = 'completed' | 'available' | 'locked';

export type Difficulty = 'facil' | 'media' | 'dificil';

interface HorarioSlot {
  dia: string;
  hora: string;
}

export interface Materia {
  id: string; // e.g., "calculo-diferencial-integral"
  codigo: string; 
  nombre: string;
  creditos: number;
  semestre: number;
  prerequisitos: string[]; // List of materia IDs
  correquisitos?: string[]; // List of materia IDs, taken together
  status: CourseStatus;
  dificultad?: Difficulty | null;
  horarioActual?: {
    profesor: string;
    horarios: HorarioSlot[];
  }[] | null;
  historialHorarios?: {
    semestre: string;
    profesor: string;
    horarios: HorarioSlot[];
  }[];
}

export interface Semestre {
  numero: number;
  materias: Materia[];
}

export interface CareerInfo {
  id: string;
  nombre: string;
  logo: string;
}

export interface University {
  id: string;
  nombre: string;
  pais: string;
  siglas: string;
}

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: Date;
}

export interface Carrera {
  id: string;
  nombre: string;
  logo: string; // Icon name from lucide-react or custom
  semestres: Semestre[];
}

export interface Curriculums {
  [key: string]: Carrera; // e.g., "software": Carrera
}
