
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Materia } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateSlug } from '@/lib/utils';


const HorarioSlotSchema = z.object({
  dia: z.string().min(1, 'El día es requerido'),
  hora: z.string().min(1, 'La hora es requerida'),
});

const HorarioActualSchema = z.array(z.object({
  profesor: z.string().optional(),
  horarios: z.array(HorarioSlotSchema).optional(),
})).nullable().optional();

const formSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  codigo: z.string().min(3, 'El código es requerido.'),
  creditos: z.coerce.number().min(1, 'Debe tener al menos 1 crédito.'),
  semestre: z.coerce.number().min(1, 'El semestre es requerido.'),
  prerequisitos: z.array(z.string()).optional(),
  correquisitos: z.array(z.string()).optional(),
  dificultad: z.enum(['facil', 'media', 'dificil']).default('media'),
  horarioActual: HorarioActualSchema,
});

type FormValues = z.infer<typeof formSchema>;

interface SubjectFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: (materia: Materia) => void;
  universityId: string;
  careerId: string;
  allMaterias: Materia[];
  initialData?: Materia | null;
}

export function SubjectForm({ isOpen, setIsOpen, onSuccess, universityId, careerId, allMaterias, initialData }: SubjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      creditos: 0,
      semestre: 1,
      prerequisitos: [],
      correquisitos: [],
      dificultad: 'media',
      horarioActual: [{ profesor: '', horarios: [] }],
    },
  });

  const watchedSemestre = form.watch('semestre');

  const { fields: professorFields, append: appendProfessor, remove: removeProfessor } = useFieldArray({
    control: form.control,
    name: "horarioActual",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          ...initialData,
          dificultad: initialData.dificultad || 'media',
          horarioActual: initialData.horarioActual && initialData.horarioActual.length > 0 ? initialData.horarioActual.map(h => ({...h, horarios: h.horarios || []})) : [{ profesor: '', horarios: [] }],
          prerequisitos: initialData.prerequisitos || [],
          correquisitos: initialData.correquisitos || [],
        });
      } else {
        form.reset({
          nombre: '',
          codigo: '',
          creditos: 0,
          semestre: 1,
          prerequisitos: [],
          correquisitos: [],
          dificultad: 'media',
          horarioActual: [{ profesor: '', horarios: [] }],
        });
      }
    }
  }, [initialData, form, isOpen]);

  useEffect(() => {
      const currentPrereqs = form.getValues('prerequisitos') || [];
      const currentCoreqs = form.getValues('correquisitos') || [];
      const newSemesterValue = form.getValues('semestre');
      
      const validPrereqs = currentPrereqs.filter(prereqId => {
          if (prereqId === 'nivelacion') return true;
          const subject = allMaterias.find(m => m.id === prereqId);
          return subject && subject.semestre < newSemesterValue;
      });
      
      const validCoreqs = currentCoreqs.filter(coreqId => {
          const subject = allMaterias.find(m => m.id === coreqId);
          return subject && subject.semestre === newSemesterValue;
      });

      if (validPrereqs.length !== currentPrereqs.length) {
          form.setValue('prerequisitos', validPrereqs, { shouldDirty: true });
      }
      if (validCoreqs.length !== currentCoreqs.length) {
          form.setValue('correquisitos', validCoreqs, { shouldDirty: true });
      }
  }, [watchedSemestre, allMaterias, form]);


  const groupedPrerequisites = useMemo(() => {
    const grouped = allMaterias
        .filter(s => s.semestre < watchedSemestre && s.id !== initialData?.id)
        .reduce((acc, subject) => {
            const semester = subject.semestre;
            if (!acc[semester]) {
                acc[semester] = [];
            }
            acc[semester].push(subject);
            return acc;
        }, {} as Record<number, Materia[]>);

    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
  }, [allMaterias, watchedSemestre, initialData]);
  
  const availableCorequisites = useMemo(() => {
    return allMaterias.filter(s => s.semestre === watchedSemestre && s.id !== initialData?.id);
  }, [allMaterias, watchedSemestre, initialData]);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const timeSlotOptions = [
    '07:00-08:00', '08:00-09:00', '09:00-10:00',
    '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00', '18:00-19:00',
    '19:00-20:00', '20:00-21:00', '21:00-22:00',
    '07:00-09:00', '09:00-11:00', '11:00-13:00',
    '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00'
  ].sort();


  async function onSubmit(values: FormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error de Autenticación', description: 'Debes iniciar sesión para realizar esta acción.' });
        return;
    }
    
    setIsLoading(true);
    
    try {
      const cleanedHorario = values.horarioActual?.map(prof => ({
        profesor: prof.profesor || 'Prof. por Asignar',
        horarios: prof.horarios?.filter(h => h.dia && h.hora) || [],
      })).filter(prof => prof.horarios.length > 0 || (prof.profesor && prof.profesor !== 'Prof. por Asignar'));

      const dataToSubmit = { 
          ...values,
          horarioActual: cleanedHorario && cleanedHorario.length > 0 ? cleanedHorario : [],
          prerequisitos: values.prerequisitos || [],
          correquisitos: values.correquisitos || [],
      };
      
      if (isEditMode && initialData) {
        const subjectRef = doc(db, 'universidades', universityId, 'carreras', careerId, 'materias', initialData.id);
        await updateDoc(subjectRef, dataToSubmit);
        const updatedMateria: Materia = { id: initialData.id, ...dataToSubmit, status: 'locked' };
        onSuccess(updatedMateria);
        toast({
          title: 'Materia Actualizada',
          description: `La materia "${values.nombre}" ha sido actualizada exitosamente.`,
        });

      } else {
        const id = generateSlug(values.codigo) || generateSlug(values.nombre);
        const subjectRef = doc(db, 'universidades', universityId, 'carreras', careerId, 'materias', id);
        const docSnap = await getDoc(subjectRef);
        if (docSnap.exists()) {
          throw new Error('Ya existe una materia con este nombre o código.');
        }
        const dataToSave = { ...dataToSubmit, historialHorarios: [] };
        await setDoc(subjectRef, dataToSave);
        const newMateria: Materia = { id, ...dataToSave, status: 'locked' };
        onSuccess(newMateria);
        toast({
          title: 'Materia Añadida',
          description: `La materia "${values.nombre}" ha sido creada exitosamente.`,
        });
      }
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('[CLIENT-SIDE ERROR] onSubmit:', error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: error.message || 'No se pudo guardar la materia. Verifica tus permisos o inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function HorarioFields({ profIndex }: { profIndex: number }) {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: `horarioActual.${profIndex}.horarios`,
    });

    return (
        <div className="space-y-2">
            <Label>Franjas Horarias</Label>
            {fields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[1fr,1fr,auto] items-start gap-2">
                <FormField
                  control={form.control}
                  name={`horarioActual.${profIndex}.horarios.${index}.dia`}
                  render={({ field }) => (
                    <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Día..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`horarioActual.${profIndex}.horarios.${index}.hora`}
                  render={({ field }) => (
                    <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Hora..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {timeSlotOptions.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ dia: '', hora: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Franja Horaria
            </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl h-full flex flex-col sm:h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Materia' : 'Añadir Nueva Materia'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Modifica los detalles de la materia.' : 'Completa los detalles de la nueva materia.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow min-h-0">
            <ScrollArea className="flex-grow -mx-6 px-6">
              <div className="space-y-6 pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 px-1">
                  <div className="md:col-span-2">
                    <FormField control={form.control} name="nombre" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Materia</FormLabel>
                        <FormControl><Input placeholder="Ej: Cálculo Vectorial" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                  
                  <FormField control={form.control} name="codigo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl><Input placeholder="EJ: ECTS001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="semestre" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semestre</FormLabel>
                      <FormControl><Input type="number" min="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="creditos" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Créditos</FormLabel>
                      <FormControl><Input type="number" min="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  
                  <FormField control={form.control} name="dificultad" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dificultad Percibida</FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-3 gap-2"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="facil" id="facil" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="facil" className={cn("flex items-center justify-center rounded-md border-2 p-3 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer", field.value === 'facil' && "bg-green-500/10 border-green-500")}>
                              Fácil
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="media" id="media" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="media" className={cn("flex items-center justify-center rounded-md border-2 p-3 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer", field.value === 'media' && "bg-yellow-500/10 border-yellow-500")}>
                              Media
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                                <RadioGroupItem value="dificil" id="dificil" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="dificil" className={cn("flex items-center justify-center rounded-md border-2 p-3 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer", field.value === 'dificil' && "bg-red-500/10 border-red-500")}>
                              Difícil
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}/>

                  <div className="md:col-span-2">
                     <FormField
                        control={form.control}
                        name="prerequisitos"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prerrequisitos</FormLabel>
                                <Accordion type="multiple" className="w-full">
                                    <AccordionItem value="main">
                                        <AccordionTrigger className="w-full justify-between font-normal rounded-md border border-input bg-background h-10 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground hover:no-underline">
                                            <span>Seleccionar ({field.value?.length || 0})</span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ScrollArea className="h-48 border rounded-md p-2 mt-2">
                                                <div className="flex items-center px-2 py-1.5">
                                                    <Checkbox
                                                        id="nivelacion-prereq"
                                                        checked={field.value?.includes('nivelacion')}
                                                        onCheckedChange={(checked) => {
                                                            const currentValues = field.value || [];
                                                            const newValues = checked
                                                                ? [...currentValues, 'nivelacion']
                                                                : currentValues.filter(id => id !== 'nivelacion');
                                                            field.onChange(newValues);
                                                        }}
                                                    />
                                                    <label htmlFor="nivelacion-prereq" className="ml-2 text-sm font-medium">Nivelación</label>
                                                </div>
                                                <Separator className="my-1"/>
                                                {groupedPrerequisites.map(([semester, subjects]) => (
                                                  <div key={semester}>
                                                      <h4 className="font-semibold text-sm px-2 py-1.5">Semestre {semester}</h4>
                                                      {subjects.map(subject => (
                                                          <div key={subject.id} className="flex items-center px-2 py-1.5 ml-2">
                                                              <Checkbox
                                                                  id={`prereq-${subject.id}`}
                                                                  checked={field.value?.includes(subject.id)}
                                                                  onCheckedChange={(checked) => {
                                                                      const currentValues = field.value || [];
                                                                      const newValues = checked
                                                                          ? [...currentValues, subject.id]
                                                                          : currentValues.filter(id => id !== subject.id);
                                                                      field.onChange(newValues);
                                                                  }}
                                                              />
                                                              <label htmlFor={`prereq-${subject.id}`} className="ml-2 text-sm font-medium">{subject.nombre} ({subject.codigo})</label>
                                                          </div>
                                                      ))}
                                                  </div>
                                                ))}
                                            </ScrollArea>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                {field.value && field.value.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mt-2">
                                        {field.value.map((prereqId) => {
                                            const subject = allMaterias.find(m => m.id === prereqId);
                                            return (
                                                <Badge variant="secondary" key={prereqId}>
                                                    {subject ? `${subject.nombre} (${subject.codigo})` : (prereqId === 'nivelacion' ? 'Nivelación' : prereqId)}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField control={form.control} name="correquisitos" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correquisitos (materias del mismo semestre)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full justify-between font-normal h-auto min-h-10", !field.value?.length && "text-muted-foreground")}
                              >
                                {field.value && field.value.length > 0 ? (
                                  <div className="flex gap-1 flex-wrap">
                                      {field.value.map((coreqId) => {
                                          const subject = allMaterias.find(m => m.id === coreqId);
                                          return (
                                              <Badge variant="secondary" key={coreqId}>
                                                  {subject ? `${subject.nombre} (${subject.codigo})` : coreqId}
                                              </Badge>
                                          );
                                      })}
                                  </div>
                                ) : (
                                  "Seleccionar correquisitos"
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <ScrollArea className="h-48">
                                  {availableCorequisites.length > 0 ? availableCorequisites.map((subject) => (
                                      <div key={subject.id} className="flex items-center px-2 py-1.5">
                                          <Checkbox
                                              id={`coreq-${subject.id}`}
                                              checked={field.value?.includes(subject.id)}
                                              onCheckedChange={(checked) => {
                                                  const newValue = checked
                                                  ? [...(field.value || []), subject.id]
                                                  : field.value?.filter(id => id !== subject.id);
                                                  field.onChange(newValue);
                                              }}
                                          />
                                          <label htmlFor={`coreq-${subject.id}`} className="ml-2 text-sm font-medium">{`${subject.nombre} (${subject.codigo})`}</label>
                                      </div>
                                  )) : <p className="p-4 text-sm text-muted-foreground">No hay correquisitos disponibles para este semestre.</p>}
                              </ScrollArea>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4 px-1">
                  <h3 className="text-lg font-medium">Horarios y Profesores</h3>
                  <div className="space-y-6">
                    {professorFields.map((profField, profIndex) => (
                      <div key={profField.id} className="rounded-md border p-4 space-y-4 relative">
                         {professorFields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeProfessor(profIndex)}>
                               <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                         )}
                         <FormField
                            control={form.control}
                            name={`horarioActual.${profIndex}.profesor`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profesor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre del profesor" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <HorarioFields profIndex={profIndex} />
                      </div>
                    ))}
                  </div>

                  <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendProfessor({ profesor: '', horarios: [] })}
                  >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Añadir Profesor
                  </Button>
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter className="pt-4 border-t mt-auto flex-shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading || !user}>
                {isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Materia')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
