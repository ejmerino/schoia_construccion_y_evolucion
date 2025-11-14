
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Calculator,
  AlertCircle,
  Award,
  Lock,
  X,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import type { Materia } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CAREER_COSTS, QUINTIL_WEIGHTS } from '@/lib/costs';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CostCalculatorProps {
  allCourses: Materia[];
  careerId: string;
  isLoggedIn: boolean;
}

export function CostCalculator({ allCourses, careerId, isLoggedIn }: CostCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<
    Record<string, { credits: number; registration: '1' | '2' | '3'; code: string }>
  >({});
  const [quintil, setQuintil] = useState<'1' | '2' | '3' | '4' | '5'>('1');

  useEffect(() => {
    if (!isOpen) {
      setSelectedCourses({});
      setQuintil('1');
    }
  }, [isOpen]);

  const careerCosts = CAREER_COSTS[careerId];
  
  const calculateVpg = useCallback((credits: number, quintilKey: '1'|'2'|'3'|'4'|'5') => {
      if (!careerCosts || !credits) return 0;
      const quintilWeight = QUINTIL_WEIGHTS[quintilKey];
      const H = credits;
      return (careerCosts.vm + (careerCosts.va * (H * 16) * 0.90)) * quintilWeight;
  }, [careerCosts]);


  const coursesBySemester = useMemo(() => {
    const grouped: Record<number, Materia[]> = {};
    allCourses
      .filter((c) => c.status === 'available')
      .forEach((course) => {
        if (!grouped[course.semestre]) {
          grouped[course.semestre] = [];
        }
        grouped[course.semestre].push(course);
      });
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
  }, [allCourses]);

  const allAvailableCourses = useMemo(() => coursesBySemester.flatMap(([, courses]) => courses), [coursesBySemester]);
  
  const isAnyCourseSelected = Object.keys(selectedCourses).length > 0;

  const thirdMatriculationCourseId = useMemo(
    () => Object.entries(selectedCourses).find(([, c]) => c.registration === '3')?.[0],
    [selectedCourses]
  );

  const handleCourseToggle = (checked: boolean, course: Materia) => {
    if (thirdMatriculationCourseId && checked && !selectedCourses[course.id]) {
      return;
    }

    setSelectedCourses((prev) => {
      const newSelections = { ...prev };
      if (checked) {
        newSelections[course.id] = {
          credits: course.creditos,
          registration: '1',
          code: course.codigo,
        };
      } else {
        delete newSelections[course.id];
      }
      return newSelections;
    });
  };

  const handleRegistrationChange = (
    courseId: string,
    registration: '1' | '2' | '3'
  ) => {
    if (registration === '3') {
      const course = allCourses.find((c) => c.id === courseId);
      if (course) {
        setSelectedCourses({
          [courseId]: { credits: course.creditos, registration: '3', code: course.codigo },
        });
      }
    } else {
      setSelectedCourses((prev) => ({
        ...prev,
        [courseId]: { ...prev[courseId], registration },
      }));
    }
  };

  const { totalCost, totalCredits, showLowCreditWarning, isThesisExemptionActive, costBreakdown } =
    useMemo(() => {
      if (!careerCosts) {
        return { totalCost: 0, totalCredits: 0, showLowCreditWarning: false, isThesisExemptionActive: false, costBreakdown: null };
      }
      
      const selectionCount = Object.keys(selectedCourses).length;
      const selectedCourseValues = Object.values(selectedCourses);
      const isOnlyThesisSelected = 
        selectionCount === 1 && 
        selectedCourseValues[0].code.includes('MIC-PROFESIONALIZANTE') && 
        selectedCourseValues[0].registration === '1';

      if (isOnlyThesisSelected) {
        return { totalCost: 0, totalCredits: selectedCourseValues[0].credits, showLowCreditWarning: false, isThesisExemptionActive: true, costBreakdown: null };
      }

      let currentTotalCredits = 0;
      let firstRegCredits = 0;
      let secondRegCredits = 0;
      let thirdRegCredits = 0;

      for (const course of selectedCourseValues) {
          currentTotalCredits += course.credits;
          if (course.registration === '1') firstRegCredits += course.credits;
          if (course.registration === '2') secondRegCredits += course.credits;
          if (course.registration === '3') thirdRegCredits += course.credits;
      }
      
      const isLowCreditScenario = currentTotalCredits < 27 && thirdRegCredits === 0;

      let cost = 0;
      let breakdown = null;
      if (isLowCreditScenario) {
          cost = calculateVpg(currentTotalCredits, quintil);
          breakdown = { first: cost, second: 0, third: 0 };
      } else {
          const secondRegCost = calculateVpg(secondRegCredits, quintil);
          const thirdRegCost = calculateVpg(thirdRegCredits, quintil);
          cost = secondRegCost + thirdRegCost;
          breakdown = { first: 0, second: secondRegCost, third: thirdRegCost };
      }

      return { 
        totalCost: cost, 
        totalCredits: currentTotalCredits, 
        showLowCreditWarning: isLowCreditScenario,
        isThesisExemptionActive: false,
        costBreakdown: breakdown,
      };
    }, [selectedCourses, quintil, careerCosts, calculateVpg]);
    
  const handleSelectAllToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (thirdMatriculationCourseId && isAnyCourseSelected) return;

    if (isAnyCourseSelected) {
      setSelectedCourses({});
    } else {
      const newSelections: Record<string, { credits: number; registration: '1' | '2' | '3'; code: string; }> = {};
      allAvailableCourses.forEach((course) => {
        newSelections[course.id] = {
          credits: course.creditos,
          registration: '1',
          code: course.codigo,
        };
      });
      setSelectedCourses(newSelections);
    }
  };

  if (!isLoggedIn) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Calculator className="mr-2 h-4 w-4" />
            Estimar Costo de Matrícula
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Función para Usuarios Registrados
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Para estimar tus costos, por favor <Link href="/login" className="underline font-semibold hover:text-primary">inicia sesión</Link> o <Link href="/signup" className="underline font-semibold hover:text-primary">crea una cuenta</Link>.
          </p>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <Calculator className="mr-2 h-4 w-4" />
            Estimar Costo de Matrícula
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-full flex flex-col p-0 sm:h-[90vh] sm:rounded-lg">
          <DialogHeader className="p-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xs md:text-base">
                <Calculator className="h-5 w-5" />
                Calculadora de Costos
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-grow flex flex-col md:grid md:grid-cols-2 overflow-hidden">
            <ScrollArea className="md:border-r">
                <div className="flex flex-col space-y-4 p-4">
                    <div>
                      <Label htmlFor="quintil-select" className="font-semibold text-xs">
                        Paso 1: Selecciona tu Quintil
                      </Label>
                      <Select
                        value={quintil}
                        onValueChange={(value: '1' | '2' | '3' | '4' | '5') =>
                          setQuintil(value)
                        }
                      >
                        <SelectTrigger id="quintil-select" className="mt-2 h-9">
                          <SelectValue placeholder="Selecciona tu quintil..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Quintil 1</SelectItem>
                          <SelectItem value="2">Quintil 2</SelectItem>
                          <SelectItem value="3">Quintil 3</SelectItem>
                          <SelectItem value="4">Quintil 4</SelectItem>
                          <SelectItem value="5">Quintil 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {!careerCosts && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Costos no definidos</AlertTitle>
                            <AlertDescription>
                                La información de costos para esta carrera aún no ha sido cargada.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="flex-shrink-0">
                      <CardHeader className="p-3">
                         <CardTitle className="text-xs">Resumen de Costos</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-xl md:text-2xl font-bold text-primary">
                          ${totalCost.toFixed(2)}
                          <span className="text-xs font-medium text-muted-foreground ml-2">({totalCredits} créditos)</span>
                        </p>
                      </CardContent>
                    </Card>

                     {thirdMatriculationCourseId ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Regla de 3ª Matrícula</AlertTitle>
                        <AlertDescription>
                          Solo puedes tomar una materia en 3ª matrícula por semestre.
                        </AlertDescription>
                      </Alert>
                    ) : isThesisExemptionActive ? (
                        <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-600 dark:text-green-300">
                            <Award className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-200">Excepción de Tesis Aplicada</AlertTitle>
                            <AlertDescription>
                            Al tomar solo la materia de titulación en 1ª matrícula, el costo es cero.
                            </AlertDescription>
                        </Alert>
                    ) : showLowCreditWarning ? (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground p-2 rounded-md bg-muted">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Al tomar menos de 27 créditos, se paga un valor proporcional incluso por materias de primera matrícula. Costo: ${costBreakdown?.first.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                        costBreakdown && (costBreakdown.second > 0 || costBreakdown.third > 0) && (
                        <div className="text-xs text-muted-foreground p-2 rounded-md bg-muted space-y-1">
                          <p>Total 2ª Matrícula: ${costBreakdown.second.toFixed(2)}</p>
                          <p>Total 3ª Matrícula: ${costBreakdown.third.toFixed(2)}</p>
                        </div>
                      )
                    )}
                </div>
             </ScrollArea>
            
            <ScrollArea>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-xs">Paso 2: Selecciona tus Materias</h3>
                        {allAvailableCourses.length > 0 && (
                            <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-xs"
                                onClick={handleSelectAllToggle}
                                disabled={!!thirdMatriculationCourseId && isAnyCourseSelected}
                            >
                                {isAnyCourseSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </Button>
                        )}
                    </div>
                    <div className="rounded-md border">
                        <div className="p-1">
                            {coursesBySemester.length > 0 ? (
                            coursesBySemester.map(([semester, courses]) => (
                            <div key={semester} className="relative">
                                <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                                    <h4 className="font-semibold text-xs py-1.5 px-2 border-b border-t">
                                    Semestre {semester}
                                    </h4>
                                </div>
                                <div className="space-y-1 py-1">
                                    {courses.map((course) => (
                                    <div key={course.id} className={cn(
                                        "grid grid-cols-[auto,1fr,auto] items-center p-2 rounded-md hover:bg-accent gap-x-3 gap-y-2",
                                        (!!thirdMatriculationCourseId && !selectedCourses[course.id]) && "opacity-50"
                                    )}>
                                        <Checkbox
                                            id={`cost-${course.id}`}
                                            checked={!!selectedCourses[course.id]}
                                            disabled={!!thirdMatriculationCourseId && !selectedCourses[course.id]}
                                            onCheckedChange={(checked) => handleCourseToggle(!!checked, course)}
                                            className="mt-1"
                                        />
                                        <label htmlFor={`cost-${course.id}`} className="text-xs font-medium cursor-pointer leading-tight break-words col-span-2">
                                            {course.nombre}
                                        </label>
                                        
                                        {selectedCourses[course.id] && (
                                        <div className="col-start-2 col-span-2">
                                            <Select
                                                value={selectedCourses[course.id].registration}
                                                onValueChange={(value: '1' | '2' | '3') => handleRegistrationChange(course.id, value)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1ª Matrícula</SelectItem>
                                                    <SelectItem value="2">2ª Matrícula</SelectItem>
                                                    <SelectItem value="3">3ª Matrícula</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        )}
                                    </div>
                                    ))}
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full p-8">
                            <p className="text-center text-sm text-muted-foreground">
                                No hay materias disponibles para seleccionar.
                            </p>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </ScrollArea>

          </div>
      </DialogContent>
    </Dialog>
  );
}

    

    