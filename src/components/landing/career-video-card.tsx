'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { CareerInfo } from '@/types';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CareerCardProps {
  career: CareerInfo & { id: string };
}

const careerImageMap: Record<string, string> = {
  'software': '/images/espe/carreras/software1.jpg',
  'administracion-de-empresas': '/images/espe/carreras/administracion_de_empresas1.jpg',
  'biotecnologia': '/images/espe/carreras/biotecnologia1.jpg',
  'agropecuaria': '/images/espe/carreras/agropecuaria1.jpg',
  'electronica-y-automatizacion': '/images/espe/carreras/electronica_y_automatizacion1.jpg',
  'civil': '/images/espe/carreras/civil1.jpg',
  'comercio-exterior': '/images/espe/carreras/comercio_exterior1.jpg',
  'contabilidad-y-auditoria': '/images/espe/carreras/contabilidad_y_auditoria1.jpg',
  'educacion-inicial': '/images/espe/carreras/educacion_inicial1.jpg',
  'geoespacial': '/images/espe/carreras/geoespacial1.jpg',
  'mecatronica': '/images/espe/carreras/mecatronica1.jpg',
  'mecanica': '/images/espe/carreras/mecanica1.jpg',
  'mercadotecnia': '/images/espe/carreras/mercadotecnia1.jpg',
  'tecnologias-de-la-informacion': '/images/espe/carreras/tics1.jpg',
  'telecomunicaciones': '/images/espe/carreras/telecomunicaciones1.jpg',
  'turismo': '/images/espe/carreras/turismo1.jpg',
};

const hintMap: Record<string, string> = {
  'software': 'software development',
  'administracion-de-empresas': 'business administration',
  'biotecnologia': 'biotechnology lab',
  'agropecuaria': 'agriculture technology',
  'civil': 'civil engineering',
  'comercio-exterior': 'foreign trade',
  'contabilidad-y-auditoria': 'accounting audit',
  'educacion-inicial': 'early education',
  'geoespacial': 'geospatial engineering',
  'mecatronica': 'mechatronics engineering',
  'mecanica': 'mechanical engineering',
  'mercadotecnia': 'marketing advertising',
  'tecnologias-de-la-informacion': 'information technology',
  'telecomunicaciones': 'telecommunications',
  'turismo': 'tourism travel',
  'electronica-y-automatizacion': 'electronics automation',
};


export function CareerVideoCard({ career }: CareerCardProps) {
  const [hasError, setHasError] = useState(false);
  const imageSrc = careerImageMap[career.id];
  const aiHint = hintMap[career.id] || career.nombre.toLowerCase().split(' ').slice(0, 2).join(' ');

  const showImage = imageSrc && !hasError;

  return (
    <Link href={`/dashboard?career=${career.id}`} className="group block h-full">
      <Card
        className="overflow-hidden h-full relative bg-black text-white transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl"
      >
        {showImage && (
          <Image 
              src={imageSrc} 
              alt={`Imagen de ${career.nombre}`}
              data-ai-hint={aiHint}
              width={600}
              height={400}
              className="absolute inset-0 h-full w-full object-cover z-0 transition-transform duration-500 ease-in-out group-hover:scale-110"
              onError={() => setHasError(true)}
          />
        )}
        <div className={cn(
            "absolute inset-0 z-10 transition-all duration-300",
            showImage ? 'bg-black/50 group-hover:bg-black/30' : 'bg-gradient-to-t from-black/70 to-transparent'
        )}></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full p-6 text-center">
            <h3 className="text-2xl font-bold transition-all duration-300 group-hover:scale-105">{career.nombre}</h3>
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                <span>Ver malla curricular</span>
                <ArrowRight className="h-4 w-4" />
            </div>
        </div>
      </Card>
    </Link>
  );
}
