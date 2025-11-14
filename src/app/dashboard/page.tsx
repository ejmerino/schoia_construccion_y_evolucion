
'use client';

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, doc, getDoc, setDoc, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Materia, CourseStatus, University } from '@/types';
import { CourseCard } from '@/components/dashboard/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, ListChecks, LogIn, SearchX, CheckSquare, Square, LayoutGrid, List, Rows3, Columns3 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CostCalculator } from '@/components/dashboard/cost-calculator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { GridView } from '@/components/dashboard/grid-view';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';

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


function CurriculumComponent() {
  const { user, userProfile, loading: authLoading, recheckUserProfile } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const universityId = searchParams.get('university') || 'espe';
  const careerId = searchParams.get('career') || 'software';

  const [baseCourses, setBaseCourses] = useState<Omit<Materia, 'status'>[]>([]);
  const [allCourses, setAllCourses] = useState<Materia[]>([]);
  const [guestCompletedIds, setGuestCompletedIds] = useState<Set<string>>(new Set());
  
  const [careerName, setCareerName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  
  const isLoggedIn = useMemo(() => !!user, [user]);

  const heroImage = careerImageMap[careerId] || '/images/espe/fondos/espe-hero.jpg';

  // Effect to save last visited career
  useEffect(() => {
      async function updateUserPreference() {
          if (user && userProfile && (userProfile.lastCareerId !== careerId || userProfile.lastUniversityId !== universityId)) {
              const userRef = doc(db, 'users', user.uid);
              try {
                  await updateDoc(userRef, {
                      lastUniversityId: universityId,
                      lastCareerId: careerId,
                  });
                  // Quietly recheck profile to update context without a toast
                  await recheckUserProfile();
              } catch (error) {
                  console.error("Failed to update user preference:", error);
                  // Don't show a toast for this, it's a non-critical background task
              }
          }
      }
      if (!authLoading) {
        updateUserPreference();
      }
  }, [user, userProfile, authLoading, careerId, universityId, recheckUserProfile]);


  const calculateStatuses = useCallback((courses: Omit<Materia, 'status'>[], completedIds: Set<string>): Materia[] => {
    return courses.map(materia => {
      const prerequisitos = materia.prerequisitos || [];

      if (completedIds.has(materia.id)) {
        return { ...materia, status: 'completed' as CourseStatus, prerequisitos };
      }
      
      const isNivelacionOnly = prerequisitos.length > 0 && prerequisitos.every(p => p.toLowerCase() === 'nivelacion');
      if (prerequisitos.length === 0 || isNivelacionOnly) {
        return { ...materia, status: 'available', prerequisitos };
      }

      const prereqsMet = prerequisitos.every(prereqId => {
        if (!prereqId || prereqId.trim().toLowerCase() === 'nivelacion') return true;
        return completedIds.has(prereqId);
      });

      return { ...materia, status: prereqsMet ? 'available' : 'locked', prerequisitos };
    });
  }, []);

  // Effect to fetch base data for the career
  useEffect(() => {
    async function fetchInitialData() {
        setIsLoading(true);
        try {
            // Fetch university data
            const universityRef = doc(db, 'universidades', universityId);
            const universitySnap = await getDoc(universityRef);
            setUniversityName(universitySnap.exists() ? universitySnap.data().nombre : 'Universidad Desconocida');
            
            // Fetch career data
            const careerRef = doc(db, 'universidades', universityId, 'carreras', careerId);
            const careerSnap = await getDoc(careerRef);
            setCareerName(careerSnap.exists() ? careerSnap.data().nombre : 'Carrera no encontrada');

            const materiasRef = collection(db, 'universidades', universityId, 'carreras', careerId, 'materias');
            const q = query(materiasRef);
            const querySnapshot = await getDocs(q);
            
            const fetchedMaterias = querySnapshot.docs.map(docSnapshot => {
                const data = docSnapshot.data();
                return {
                id: docSnapshot.id,
                nombre: data.nombre || 'Sin Nombre',
                codigo: data.codigo || 'S/C',
                creditos: data.creditos || 0,
                semestre: data.semestre || 0,
                prerequisitos: data.prerequisitos || [],
                correquisitos: data.correquisitos || [],
                dificultad: data.dificultad || null,
                horarioActual: data.horarioActual || null,
                historialHorarios: data.historialHorarios || [],
                } as Omit<Materia, 'status'>;
            });

            fetchedMaterias.sort((a, b) => a.semestre - b.semestre || a.nombre.localeCompare(b.nombre));
            setBaseCourses(fetchedMaterias);

        } catch (error: any) {
            console.error("Error fetching data from Firestore:", error);
            toast({
                variant: "destructive",
                title: "Error al cargar los datos",
                description: "No se pudo obtener la información de la carrera."
            });
        } finally {
            setIsLoading(false);
        }
    }
    fetchInitialData();
  }, [careerId, universityId, toast]);

  // Effect to calculate statuses on initial load or user change
  useEffect(() => {
    if (isLoading || authLoading) return;

    const loadProgressAndCalculate = async () => {
        let completedIds = new Set<string>();
        if (isLoggedIn && user) {
            const progressRef = doc(db, 'users', user.uid, 'progress', careerId);
            const progressSnap = await getDoc(progressRef);
            if (progressSnap.exists() && progressSnap.data().completed) {
                completedIds = new Set(progressSnap.data().completed);
            }
        } else {
            completedIds = guestCompletedIds;
        }
        
        const initialCourses = calculateStatuses(baseCourses, completedIds);
        setAllCourses(initialCourses);
    };

    loadProgressAndCalculate();
  }, [isLoading, authLoading, baseCourses, isLoggedIn, user, careerId, calculateStatuses, guestCompletedIds]);


  const updateStateAndPersistence = useCallback(async (newCompletedIds: Set<string>) => {
    const updatedCourses = calculateStatuses(baseCourses, newCompletedIds);
    setAllCourses(updatedCourses);

    if (isLoggedIn && user) {
      const progressRef = doc(db, 'users', user.uid, 'progress', careerId);
      try {
        await setDoc(progressRef, { completed: Array.from(newCompletedIds) }, { merge: true });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al guardar",
          description: "No se pudo guardar tu progreso."
        });
      }
    } else {
      setGuestCompletedIds(newCompletedIds);
    }
  }, [baseCourses, calculateStatuses, isLoggedIn, user, careerId, toast]);

  const handleToggleComplete = useCallback(async (materiaId: string) => {
    const coursesById = new Map(baseCourses.map(c => [c.id, c]));
    
    const currentCompletedIds = new Set(allCourses.filter(c => c.status === 'completed').map(m => m.id));
    const newCompletedIds = new Set(currentCompletedIds);

    if (newCompletedIds.has(materiaId)) {
        let idsToDeselect = new Set([materiaId]);
        let changedInLoop = true;
        while(changedInLoop) {
            changedInLoop = false;
            const coursesToCheck = Array.from(newCompletedIds).filter(id => !idsToDeselect.has(id));
            for (const id of coursesToCheck) {
                const course = coursesById.get(id);
                if (!course) continue;
                const shouldDeselect = (course.prerequisitos || []).some(p => p && p.toLowerCase() !== 'nivelacion' && idsToDeselect.has(p));
                if (shouldDeselect && !idsToDeselect.has(id)) {
                    idsToDeselect.add(id);
                    changedInLoop = true;
                }
            }
        }
        idsToDeselect.forEach(id => newCompletedIds.delete(id));
    } else {
        newCompletedIds.add(materiaId);
    }
    
    await updateStateAndPersistence(newCompletedIds);
  }, [baseCourses, allCourses, updateStateAndPersistence]);

  const handleToggleSemester = useCallback(async (semesterMaterias: Materia[]) => {
      const selectableMaterias = semesterMaterias.filter(m => m.status !== 'locked');
      if (selectableMaterias.length === 0) return;

      const allSelectableCompleted = selectableMaterias.every(m => m.status === 'completed');
      
      const coursesById = new Map(baseCourses.map(c => [c.id, c]));
      let newCompletedIds = new Set(allCourses.filter(c => c.status === 'completed').map(m => m.id));
      
      if (allSelectableCompleted) {
          let idsToDeselect = new Set(selectableMaterias.map(m => m.id));
          let changedInLoop = true;
          while (changedInLoop) {
              changedInLoop = false;
              const coursesToCheck = Array.from(newCompletedIds).filter(id => !idsToDeselect.has(id));
              for (const id of coursesToCheck) {
                  const course = coursesById.get(id);
                  if (!course) continue;
                  const shouldDeselect = (course.prerequisitos || []).some(p => p && p.toLowerCase() !== 'nivelacion' && idsToDeselect.has(p));
                  if (shouldDeselect && !idsToDeselect.has(id)) {
                      idsToDeselect.add(id);
                      changedInLoop = true;
                  }
              }
          }
          idsToDeselect.forEach(id => newCompletedIds.delete(id));
      } else {
          const availableToSelect = semesterMaterias.filter(m => m.status === 'available');
          availableToSelect.forEach(m => newCompletedIds.add(m.id));
      }

      await updateStateAndPersistence(newCompletedIds);
  }, [baseCourses, allCourses, updateStateAndPersistence]);

  
  const displayedCourses = useMemo(() => {
    return showOnlyAvailable 
      ? allCourses.filter(c => c.status === 'available' || c.status === 'completed') 
      : allCourses;
  }, [allCourses, showOnlyAvailable]);
  
  const availableNow = useMemo(() => {
      const bySemester: Record<number, Materia[]> = {};
      allCourses
          .filter(c => c.status === 'available')
          .forEach(course => {
              if (!bySemester[course.semestre]) {
                  bySemester[course.semestre] = [];
              }
              bySemester[course.semestre].push(course);
          });
      return Object.entries(bySemester).sort(([a], [b]) => Number(a) - Number(b));
  }, [allCourses]);

  const semesters = useMemo(() => {
    const semesterMap: Record<number, Materia[]> = {};
    displayedCourses.forEach((materia) => {
      const semesterNum = materia.semestre || 0;
      if (!semesterMap[semesterNum]) { semesterMap[semesterNum] = []; }
      semesterMap[semesterNum].push(materia);
    });
    return Object.entries(semesterMap).sort(([a], [b]) => Number(a) - Number(b));
  }, [displayedCourses]);

  const totalCredits = useMemo(() => baseCourses.reduce((sum, course) => sum + course.creditos, 0), [baseCourses]);
  const completedCredits = useMemo(() => allCourses.filter(c => c.status === 'completed').reduce((sum, course) => sum + course.creditos, 0), [allCourses]);
  const progressPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;

  if (isLoading || authLoading) {
     return (
      <div className="container mx-auto py-8 pt-24">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
        </div>
        <Skeleton className="mt-8 h-96 w-full" />
      </div>
    );
  }

  return (
    <>
      <section className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center bg-black text-white">
          <div className="absolute inset-0 z-0">
             <Image 
                src={heroImage}
                alt={`Imagen de portada para ${careerName}`}
                fill
                className="object-cover"
                priority
              />
            <div className="absolute inset-0 bg-black/60" />
          </div>
           <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                {careerName}
              </h1>
              <p className="mt-2 text-lg font-medium text-white/90" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
                {universityName}
              </p>
          </div>
      </section>

      <div className="container mx-auto pb-6 lg:pb-8 -mt-24 relative z-20">
        
        {!isLoggedIn && (
          <Alert className="mb-6 bg-card/80 backdrop-blur-sm border-border">
            <LogIn className="h-4 w-4" />
            <AlertTitle>Estás en modo invitado</AlertTitle>
            <AlertDescription>
                Puedes marcar y desmarcar materias para ver tu progreso, pero no se guardará. Para guardar tu avance, por favor{' '}
                <Link href="/login" className="font-bold underline hover:text-primary">
                inicia sesión
                </Link> o{' '}
                <Link href="/signup" className="font-bold underline hover:text-primary">
                crea una cuenta
                </Link>.
            </AlertDescription>
          </Alert>
        )}

        <Card>
             <CardContent className="p-4 sm:p-6">
                 {baseCourses.length === 0 ? (
                    <Alert>
                      <SearchX className="h-4 w-4" />
                      <AlertTitle>No hay materias para esta carrera</AlertTitle>
                      <AlertDescription>
                        No se encontró el plan de estudios para la carrera seleccionada. Por favor, elige otra carrera o contacta al administrador.
                      </AlertDescription>
                    </Alert>
                ) : (
                    <>
                    <p className="text-center text-sm text-muted-foreground mb-6">
                      Selecciona las materias que ya aprobaste para ver tu progreso y descubrir qué puedes tomar a continuación.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="show-available-toggle"
                                checked={showOnlyAvailable}
                                onCheckedChange={setShowOnlyAvailable}
                            />
                            <Label htmlFor="show-available-toggle">Mostrar solo disponibles y aprobadas</Label>
                        </div>
                        {isLoggedIn && (
                        <div className="w-full sm:w-1/2 lg:w-1/3">
                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>Progreso de la Carrera</span>
                                <span className="font-medium text-foreground">{progressPercentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={progressPercentage} aria-label={`${progressPercentage.toFixed(0)}% completado`} />
                        </div>
                        )}
                    </div>
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex flex-shrink-0 flex-wrap items-center justify-start gap-2">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <ListChecks className="mr-2 h-4 w-4" />
                                        Materias Disponibles
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Materias que puedes tomar</SheetTitle>
                                        <SheetDescription>
                                            Estas son las materias desbloqueadas según tu progreso actual.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <ScrollArea className="h-[calc(100%-4rem)] mt-4">
                                        <div className="space-y-6 pr-4">
                                            {availableNow.length > 0 ? availableNow.map(([semester, courses]) => (
                                                <div key={semester}>
                                                    <h4 className="font-semibold mb-3 border-b pb-2">Semestre {semester}</h4>
                                                    <div className="space-y-2">
                                                        {courses.map(course => (
                                                            <Card key={course.id} className="p-3">
                                                                <p className="font-medium">{course.nombre}</p>
                                                                <p className="text-xs text-muted-foreground">{course.codigo} - {course.creditos} créditos</p>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )) : <p className="text-muted-foreground text-center pt-8">¡Felicidades! Parece que has completado todas las materias.</p>}
                                        </div>
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
                            <CostCalculator allCourses={allCourses} careerId={careerId} isLoggedIn={isLoggedIn} />
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border p-1">
                            <div>
                                <p className="text-xs text-center font-semibold mb-1 text-muted-foreground">Vista</p>
                                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as 'card' | 'grid')}} aria-label="Selector de vista">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <ToggleGroupItem value="grid" aria-label="Vista de Malla">
                                                    <LayoutGrid className="h-4 w-4" />
                                                </ToggleGroupItem>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Vista de Malla</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <ToggleGroupItem value="card" aria-label="Vista de Tarjetas">
                                                    <List className="h-4 w-4" />
                                                </ToggleGroupItem>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Vista de Tarjetas</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </ToggleGroup>
                            </div>
                            <AnimatePresence>
                            {viewMode === 'grid' && (
                                <motion.div
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: 'auto' }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-xs text-center font-semibold mb-1 text-muted-foreground">Orientación</p>
                                  <ToggleGroup type="single" value={orientation} onValueChange={(value) => { if (value) setOrientation(value as 'horizontal' | 'vertical')}} aria-label="Selector de orientación">
                                      <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <ToggleGroupItem value="horizontal" aria-label="Orientación Horizontal">
                                                    <Columns3 className="h-4 w-4" />
                                                </ToggleGroupItem>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Orientación Horizontal</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <ToggleGroupItem value="vertical" aria-label="Orientación Vertical">
                                                    <Rows3 className="h-4 w-4" />
                                                </ToggleGroupItem>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Orientación Vertical</p></TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                  </ToggleGroup>
                                </motion.div>
                            )}
                            </AnimatePresence>
                       </div>
                    </div>
                    
                    {viewMode === 'grid' ? (
                        <GridView 
                            allCourses={allCourses}
                            onToggleComplete={handleToggleComplete}
                            onToggleSemester={handleToggleSemester}
                            showOnlyAvailable={showOnlyAvailable}
                            orientation={orientation}
                        />
                    ) : (
                        semesters.length > 0 ? (
                        <Tabs defaultValue={semesters[0]?.[0]} className="w-full">
                            <ScrollArea className="w-full whitespace-nowrap rounded-md">
                                <TabsList className="inline-flex">
                                {semesters.map(([semester]) => (
                                    <TabsTrigger key={semester} value={semester.toString()}>
                                    Semestre {semester}
                                    </TabsTrigger>
                                ))}
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                            {semesters.map(([semester, semesterMaterias]) => {
                            const selectableMaterias = semesterMaterias.filter(m => m.status !== 'locked');
                            const allSelectableCompleted = selectableMaterias.length > 0 && selectableMaterias.every(m => m.status === 'completed');
                            
                            return (
                                <TabsContent key={semester} value={semester.toString()} className="mt-4">
                                    <div className="mb-4">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleToggleSemester(semesterMaterias)}
                                        disabled={selectableMaterias.length === 0}
                                    >
                                        {allSelectableCompleted ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                                        {allSelectableCompleted ? 'Desmarcar todo el semestre' : 'Marcar todo el semestre'}
                                    </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {semesterMaterias.map((materia) => (
                                        <CourseCard
                                            key={materia.id}
                                            materia={materia}
                                            allMaterias={allCourses}
                                            onToggleComplete={() => handleToggleComplete(materia.id)}
                                        />
                                    ))}
                                    </div>
                                </TabsContent>
                            );
                            })}
                        </Tabs>
                        ) : (
                        <Alert>
                            <BookOpen className="h-4 w-4" />
                            <AlertTitle>¡Todo despejado!</AlertTitle>
                            <AlertDescription>
                                No hay materias que mostrar con el filtro actual. Prueba desactivar "Mostrar solo disponibles".
                            </AlertDescription>
                        </Alert>
                        )
                    )}
                  </>
                )}
             </CardContent>
        </Card>
      </div>
    </>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={
        <div className="container mx-auto py-8 pt-24">
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
            </div>
            <Skeleton className="mt-8 h-96 w-full" />
        </div>
    }>
      <CurriculumComponent />
    </Suspense>
  );
}

