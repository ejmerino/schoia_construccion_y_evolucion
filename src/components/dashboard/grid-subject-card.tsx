
'use client';

import type { Materia } from '@/types';
import { cn } from '@/lib/utils';
import { getAreaByCode } from '@/lib/subject-areas';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GridSubjectCardProps {
  materia: Materia;
  onToggleComplete: (materiaId: string) => void;
  allMaterias: Materia[];
}

export function GridSubjectCard({ materia, onToggleComplete, allMaterias }: GridSubjectCardProps) {
  const area = getAreaByCode(materia.codigo);

  const handleClick = () => {
    if (materia.status !== 'locked') {
      onToggleComplete(materia.id);
    }
  };

  const prereqDetails = (materia.prerequisitos || [])
    .map(prereqId => {
      if (prereqId.toLowerCase() === 'nivelacion') return 'Nivelación';
      const found = allMaterias.find(m => m.id === prereqId);
      return found ? `${found.nombre} (${found.codigo})` : null;
    })
    .filter(Boolean);

  const tooltipContent = (
    <div className="max-w-xs text-center">
      <p className="font-bold">{materia.nombre}</p>
      <p className="text-xs text-muted-foreground">{area.name}</p>
      {prereqDetails.length > 0 && (
        <div className="mt-2 border-t pt-2 text-left">
          <p className="text-xs font-semibold">Prerrequisitos:</p>
          <ul className="list-disc list-inside text-xs">
            {prereqDetails.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className={cn(
              'relative flex flex-col h-full min-h-[110px] w-full rounded-md overflow-hidden text-center transition-all duration-200 border',
              materia.status === 'locked' && 'opacity-50 grayscale-[80%] cursor-not-allowed',
              materia.status === 'available' && `hover:border-primary/80 hover:shadow-md cursor-pointer`,
              materia.status === 'completed' && `cursor-pointer`,
              'bg-card'
            )}
          >
            {/* Header */}
            <div className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-semibold flex justify-between items-center">
              <span>{materia.codigo}</span>
            </div>

            {/* Body */}
            <div 
                className="flex-grow flex items-center justify-center p-2"
                style={{ 
                    backgroundColor: area.color,
                    color: area.textColor,
                }}
            >
              <p className="font-bold text-[11px] leading-tight break-words [word-break:break-word] whitespace-pre-wrap">
                {materia.nombre}
              </p>
            </div>

            {/* Footer */}
            <div className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-semibold">
              {materia.creditos} créditos
            </div>

            {/* Completed Overlay */}
            {materia.status === 'completed' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="h-0.5 w-full bg-slate-200/80 rotate-[-45deg] scale-125" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

