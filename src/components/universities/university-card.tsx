'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import type { University } from '@/types';
import { cn } from '@/lib/utils';
import React from 'react';

interface UniversityCardProps {
  university: University;
}

const universityMediaMap: Record<string, { poster: string; hint: string }> = {
  espe: {
    poster: '/images/espe/campus_espe.png',
    hint: 'university campus ecuador',
  },
};

export function UniversityCard({ university }: UniversityCardProps) {
  const media = universityMediaMap[university.id];

  return (
    <Link href={`/careers?university=${university.id}`} className="group block h-full">
      <Card
        className="relative h-full min-h-[320px] w-full overflow-hidden transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:shadow-xl bg-secondary"
      >
        <Image
          src={media ? media.poster : `https://placehold.co/600x400/1e293b/ffffff?text=${university.siglas}`}
          alt={`Campus de ${university.nombre}`}
          data-ai-hint={media ? media.hint : `university campus ${university.pais.toLowerCase()}`}
          fill
          className="object-cover z-0 transition-transform duration-500 ease-in-out group-hover:scale-110"
          priority={university.id === 'espe'}
        />
        <div className={cn(
          "absolute inset-0 z-10 transition-all duration-300",
          'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
        )}></div>
        <div className="relative z-20 flex h-full flex-col justify-end p-6 text-left text-white">
          <h3 className="text-2xl font-bold leading-tight" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.8)'}}>{university.nombre}</h3>
          <p className="text-lg font-medium text-white/90" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>{university.siglas}</p>
        </div>
      </Card>
    </Link>
  );
}
