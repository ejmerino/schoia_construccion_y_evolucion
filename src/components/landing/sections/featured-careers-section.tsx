'use client';

import * as React from 'react';
import type { CareerInfo } from '@/types';
import { CareerVideoCard } from '@/components/landing/career-video-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedCareersSectionProps {
  careers: (CareerInfo & { id: string })[];
}

export function FeaturedCareersSection({ careers }: FeaturedCareersSectionProps) {
  const [featuredCareers, setFeaturedCareers] = React.useState<(CareerInfo & { id: string })[]>([]);

  React.useEffect(() => {
    if (careers.length > 0) {
      const shuffled = [...careers].sort(() => 0.5 - Math.random());
      setFeaturedCareers(shuffled.slice(0, 3));
    }
  }, [careers]);

  return (
    <section id="carreras-destacadas" className="w-full py-16 md:py-24 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Explora algunas carreras</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-xl">
            Da el primer paso. Descubre algunas de las carreras que puedes planificar en la plataforma.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[320px]">
          {featuredCareers.length > 0 ? (
            featuredCareers.map((carrera) => (
              <CareerVideoCard
                key={carrera.id}
                career={carrera}
              />
            ))
          ) : (
             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)
          )}
        </div>
        <div className="text-center mt-12">
          <Link href="/universities">
            <Button size="lg">Ver todas las universidades</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
