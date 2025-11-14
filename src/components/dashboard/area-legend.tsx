
'use client';

import { SUBJECT_AREA_CONFIG } from '@/lib/subject-areas';

export function AreaLegend() {
  const legendItems = Object.entries(SUBJECT_AREA_CONFIG);
  
  return (
    <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <h3 className="text-sm font-semibold mb-3 text-center">Leyenda de Áreas de Conocimiento</h3>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {legendItems.map(([key, { name, color }]) => {
            if (key === 'DEFAULT' || key === 'TITULACION') return null;
            return (
              <div key={key} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            );
        })}
        </div>
    </div>
  );
}

