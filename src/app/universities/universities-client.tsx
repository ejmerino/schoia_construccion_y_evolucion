'use client';

import type { University } from '@/types';
import { UniversityCard } from '@/components/universities/university-card';

interface UniversitiesClientProps {
  universities: University[];
}

export function UniversitiesClient({ universities }: UniversitiesClientProps) {
  return (
    <div className="bg-background">
      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Elige una Universidad</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-xl">
            Selecciona una institución para explorar sus carreras y planes de estudio.
          </p>
        </div>
        <div className="mx-auto grid max-w-sm grid-cols-1 gap-8 justify-center sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
          {universities.map((university) => (
             <UniversityCard key={university.id} university={university} />
          ))}
          {universities.length === 0 && (
            <p className="text-center text-muted-foreground col-span-full">No se pudieron cargar las universidades. Inténtalo de nuevo más tarde.</p>
          )}
        </div>
      </section>
    </div>
  );
}
