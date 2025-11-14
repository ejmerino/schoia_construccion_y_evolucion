'use client';

import { AnimatedCounter } from '@/components/ui/animated-counter';
import { University, BookCopy, GraduationCap } from 'lucide-react';

interface StatsSectionProps {
  stats: {
    universityCount: number;
    careerCount: number;
    subjectCount: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
    const platformStats = [
      { title: 'Universidades', value: stats.universityCount, icon: University },
      { title: 'Carreras', value: stats.careerCount, icon: BookCopy },
      { title: 'Materias', value: stats.subjectCount, icon: GraduationCap },
  ];

    return (
        <section className="w-full relative py-16 md:py-24 overflow-hidden bg-black">
         <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 z-0"
          >
            <source src="/videos/diversas_personas.mp4" type="video/mp4" />
          </video>
        <div className="container relative z-20 mx-auto px-4">
          <div className="mb-12 text-center text-white">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>Datos que reflejan la utilidad de nuestra comunidad</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-200 md:text-xl" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
              Una comunidad en constante expansión para apoyar tu viaje académico.
            </p>
          </div>
          <div className="mx-auto grid max-w-sm grid-cols-1 gap-12 justify-center text-center sm:max-w-4xl sm:grid-cols-3">
             {platformStats.map((stat) => (
                <div key={stat.title} className="flex flex-col items-center gap-2">
                  <stat.icon className="h-10 w-10 text-primary" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}/>
                  <p className="text-5xl font-bold text-white" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-xl text-gray-200" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>{stat.title}</p>
                </div>
             ))}
          </div>
        </div>
      </section>
    );
}
