'use client';

import type { CareerInfo, University } from '@/types';
import { CareerVideoCard } from '@/components/landing/career-video-card';

interface CareersPageClientProps {
  careers: (CareerInfo & { id: string })[];
  university?: University | null;
}

const universityVideoMap: Record<string, string> = {
  espe: '/videos/espe/fondos/espe1.mp4',
};

export function CareersPageClient({ careers, university }: CareersPageClientProps) {
  const heroVideo = university ? universityVideoMap[university.id] : undefined;
  
  return (
    <>
      <section 
        className="relative h-[50vh] min-h-[350px] w-full flex flex-col items-center justify-center text-center text-white p-4 overflow-hidden"
        data-ai-hint="university students"
      >
        {heroVideo ? (
            <>
                <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />
                <video
                  src={heroVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 z-0"
                  poster="/images/espe/fondos/espe-hero.jpg" // Poster as fallback
                />
            </>
        ) : (
            <div className="absolute inset-0 bg-primary" />
        )}
        <div className="relative z-20">
          <p className="text-lg font-medium tracking-wide">Explora las carreras en</p>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mt-1" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.5)'}}>
            {university?.nombre || 'la Universidad'}
          </h1>
          {university?.siglas && (
            <p className="text-xl text-white/80 mt-2" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.5)'}}>
                {university.siglas}
            </p>
          )}
        </div>
      </section>

      <div className="bg-background">
        <section className="container mx-auto px-4 py-16 md:py-24">
           <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Elige tu Carrera</h2>
            </div>
          <div className="mx-auto grid max-w-sm grid-cols-1 gap-8 justify-center sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((carrera) => (
              <CareerVideoCard
                  key={carrera.id}
                  career={carrera}
                />
            ))}
            {careers.length === 0 && (
              <p className="text-center text-muted-foreground col-span-full">No se encontraron carreras para esta universidad.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
