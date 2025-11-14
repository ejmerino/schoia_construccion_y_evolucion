
'use client';

import { useMemo } from 'react';
import type { Materia } from '@/types';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { GridSubjectCard } from './grid-subject-card';
import { AreaLegend } from './area-legend';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GridViewProps {
  allCourses: Materia[];
  onToggleComplete: (materiaId: string) => void;
  onToggleSemester: (materias: Materia[]) => void;
  showOnlyAvailable: boolean;
  orientation: 'horizontal' | 'vertical';
}

const romanNumerals: { [key: number]: string } = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
};

export function GridView({ allCourses, onToggleComplete, onToggleSemester, showOnlyAvailable, orientation }: GridViewProps) {
  const displayedCourses = useMemo(() => {
    return showOnlyAvailable
      ? allCourses.filter(c => c.status === 'available' || c.status === 'completed')
      : allCourses;
  }, [allCourses, showOnlyAvailable]);

  const semesters = useMemo(() => {
    const semesterMap: Record<number, Materia[]> = {};
    displayedCourses.forEach((materia) => {
      const semesterNum = materia.semestre || 0;
      if (semesterNum === 0) return; // Don't show semester 0
      if (!semesterMap[semesterNum]) {
        semesterMap[semesterNum] = [];
      }
      semesterMap[semesterNum].push(materia);
    });
    return Object.entries(semesterMap).sort(([a], [b]) => Number(a) - Number(b));
  }, [displayedCourses]);

  const maxCoursesInSemester = useMemo(() => {
    if (semesters.length === 0) return 0;
    return Math.max(...semesters.map(([, courses]) => courses.length));
  }, [semesters]);
  
  if (semesters.length === 0) {
      return <p className="text-center py-8 text-muted-foreground">No hay materias que mostrar con el filtro actual.</p>
  }
  
  const isHorizontal = orientation === 'horizontal';

  const gridStyles = isHorizontal ? {
    gridTemplateColumns: `repeat(${semesters.length}, minmax(140px, 1fr))`,
    gridTemplateRows: `auto repeat(${maxCoursesInSemester}, 1fr)`,
  } : {
    gridTemplateColumns: `auto repeat(${maxCoursesInSemester}, minmax(140px, 1fr))`,
    gridTemplateRows: `repeat(${semesters.length}, auto)`,
  };

  return (
    <div>
      <TooltipProvider>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div 
                className="grid gap-px p-px bg-border"
                style={gridStyles}
            >
                {semesters.map(([semester, courses], index) => (
                    <Tooltip key={semester}>
                       <TooltipTrigger asChild>
                          <div
                              onClick={() => onToggleSemester(courses)}
                              className={cn(
                                "flex items-center justify-center font-bold text-sm bg-card cursor-pointer hover:bg-accent transition-colors",
                                isHorizontal ? 'h-10' : 'min-h-28 px-2'
                              )}
                              style={isHorizontal ? { gridColumn: index + 1, gridRow: 1 } : { gridRow: index + 1, gridColumn: 1 }}
                          >
                              {romanNumerals[Number(semester)] || semester}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Marcar/desmarcar todo el semestre</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                {semesters.map(([semester, courses], semesterIndex) =>
                    courses.map((course, courseIndex) => (
                        <div
                            key={course.id}
                            className="bg-card p-1"
                            style={isHorizontal 
                                ? { gridColumn: semesterIndex + 1, gridRow: courseIndex + 2 } 
                                : { gridRow: semesterIndex + 1, gridColumn: courseIndex + 2 }
                            }
                        >
                            <GridSubjectCard 
                                materia={course}
                                onToggleComplete={onToggleComplete}
                                allMaterias={allCourses}
                            />
                        </div>
                    ))
                )}
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
        </ScrollArea>
      </TooltipProvider>
        <AreaLegend />
    </div>
  );
}
