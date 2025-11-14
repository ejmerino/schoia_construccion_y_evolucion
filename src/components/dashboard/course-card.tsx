
'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Materia, CourseStatus, Difficulty } from '@/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Lock, CheckCircle2, BookOpen, Clock, GraduationCap, Users, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { ScheduleDisplay } from './schedule-display';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface MateriaCardProps {
  materia: Materia;
  allMaterias: Materia[];
  onToggleComplete: (materiaId: string) => void;
}

const statusConfig: Record<CourseStatus, {
  cardClass: string;
  text: string;
  icon: React.ReactNode;
  descriptionClass: string;
  checkboxClass?: string;
}> = {
  completed: {
    cardClass: 'border-l-4 border-green-600 bg-green-500/10 dark:bg-green-900/30',
    text: 'Aprobada',
    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    descriptionClass: 'text-green-800/80 dark:text-green-300/80',
    checkboxClass: 'border-green-600 text-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white'
  },
  available: {
    cardClass: 'hover:border-primary/50 hover:bg-accent/50 transition-all duration-200',
    text: 'Disponible',
    icon: <BookOpen className="h-4 w-4 text-primary" />,
    descriptionClass: 'text-muted-foreground',
    checkboxClass: 'border-primary'
  },
  locked: {
    cardClass: 'bg-muted/50 border-border opacity-70',
    text: 'Bloqueada',
    icon: <Lock className="h-4 w-4" />,
    descriptionClass: 'text-muted-foreground',
  },
};

const difficultyConfig: Record<Difficulty, { 
    badgeClass: string;
    icon: React.ReactNode;
}> = {
    facil: {
        badgeClass: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
        icon: <ThumbsUp className="h-4 w-4 text-green-600"/>
    },
    media: {
        badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
        icon: <Meh className="h-4 w-4 text-yellow-600"/>
    },
    dificil: {
        badgeClass: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
        icon: <ThumbsDown className="h-4 w-4 text-red-600"/>
    }
};


export function CourseCard({ materia, allMaterias, onToggleComplete }: MateriaCardProps) {
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (materia.status === 'locked') return;
    onToggleComplete(materia.id);
  };
  
  const config = statusConfig[materia.status];

  const hasNivelacion = useMemo(() => 
      materia.prerequisitos?.some(p => p && p.trim().toLowerCase() === 'nivelacion'), 
      [materia.prerequisitos]
  );
  
  const prereqDetails = useMemo(() => 
    materia.prerequisitos
      ?.filter(prereqId => prereqId && prereqId.trim().toLowerCase() !== 'nivelacion')
      .map(prereqId => allMaterias.find(m => m.id === prereqId))
      .filter((m): m is Materia => !!m), // Filter out any null/undefined results
  [materia.prerequisitos, allMaterias]);
  
  const coreqDetails = useMemo(() => 
    materia.correquisitos
      ?.map(coreqId => allMaterias.find(m => m.id === coreqId))
      .filter((m): m is Materia => !!m),
  [materia.correquisitos, allMaterias]);


  return (
    <Dialog>
      <Card className={cn("relative transition-all duration-300 flex flex-col justify-between h-full group", config.cardClass)}>
        <CardHeader className="flex-grow p-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-bold leading-tight pr-8">{materia.nombre}</CardTitle>
              <CardDescription className={cn('text-xs mt-1', config.descriptionClass)}>
                {materia.codigo}
              </CardDescription>
            </div>
          </div>
           <div 
             onClick={handleCheckboxClick} 
             title={materia.status !== 'locked' ? "Marcar como completada" : "Bloqueada"}
             className={cn(
                 "absolute top-4 right-4 h-5 w-5 rounded z-10 flex items-center justify-center",
                 materia.status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'
             )}
           >
             <Checkbox
               checked={materia.status === 'completed'}
               disabled={materia.status === 'locked'}
               aria-label={`Marcar ${materia.nombre} como completada`}
               className={cn("h-5 w-5", config.checkboxClass)}
             />
           </div>
        </CardHeader>
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs">
          <Badge variant="outline" className="font-mono">{materia.creditos} créditos</Badge>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-semibold">
              {config.icon}
              <span>{config.text}</span>
            </div>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground transition-colors hover:text-foreground">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Ver detalles</span>
              </Button>
            </DialogTrigger>
          </div>
        </CardFooter>
      </Card>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{materia.nombre}</DialogTitle>
          <DialogDescription>{materia.codigo} - {materia.creditos} créditos</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-2">
            
            {materia.dificultad && (
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
                   {difficultyConfig[materia.dificultad].icon}
                   <span className="font-semibold">Dificultad:</span>
                   <Badge variant="outline" className={cn("capitalize", difficultyConfig[materia.dificultad].badgeClass)}>
                       {materia.dificultad}
                   </Badge>
                </div>
            )}
            
            <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><GraduationCap className="h-4 w-4 text-muted-foreground"/>Prerrequisitos</h4>
                  {(prereqDetails && prereqDetails.length > 0) || hasNivelacion ? (
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                      {hasNivelacion && <li>Requiere aprobación del curso de Nivelación</li>}
                      {prereqDetails?.map(p => <li key={p.id}>{p.nombre} ({p.codigo})</li>)}
                      </ul>
                  ) : (
                      <p className="text-sm text-muted-foreground">Esta materia no tiene prerrequisitos.</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground"/>Correquisitos</h4>
                  {(coreqDetails && coreqDetails.length > 0) ? (
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                      {coreqDetails?.map(p => <li key={p.id}>{p.nombre} ({p.codigo})</li>)}
                      </ul>
                  ) : (
                      <p className="text-sm text-muted-foreground">Esta materia no tiene correquisitos.</p>
                  )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
