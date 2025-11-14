'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { CareerInfo } from '@/types';
import { iconKeys, Icons } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateSlug } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';


const careerFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  logo: z.string({ required_error: 'Debes seleccionar un ícono.' }).min(1, 'Debes seleccionar un ícono.'),
});

type CareerFormValues = z.infer<typeof careerFormSchema>;

interface CareerFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: (career: CareerInfo) => void;
  universityId: string;
  initialData?: CareerInfo | null;
}

export function CareerForm({ isOpen, setIsOpen, onSuccess, universityId, initialData }: CareerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!initialData;

  const form = useForm<CareerFormValues>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: {
      nombre: '',
      logo: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            form.reset({ nombre: initialData.nombre, logo: initialData.logo });
        } else {
            form.reset({ nombre: '', logo: '' });
        }
    }
  }, [initialData, form, isOpen]);

  async function onSubmit(values: CareerFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión.' });
        return;
    }
    setIsLoading(true);
    try {
      if (isEditMode && initialData) {
        const careerRef = doc(db, 'universidades', universityId, 'carreras', initialData.id);
        await updateDoc(careerRef, values);
        onSuccess({ id: initialData.id, ...values });
      } else {
        const id = generateSlug(values.nombre);
        const careerRef = doc(db, 'universidades', universityId, 'carreras', id);
        const docSnap = await getDoc(careerRef);
        if (docSnap.exists()) {
          throw new Error('Ya existe una carrera con este nombre.');
        }
        await setDoc(careerRef, values);
        onSuccess({ id, ...values });
      }

      toast({
        title: isEditMode ? 'Carrera Actualizada' : 'Carrera Añadida',
        description: `La carrera "${values.nombre}" ha sido ${isEditMode ? 'actualizada' : 'creada'} exitosamente.`,
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: isEditMode ? 'Error al actualizar' : 'Error al añadir',
        description: error.message || `No se pudo ${isEditMode ? 'actualizar' : 'crear'} la carrera. Inténtalo de nuevo.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Carrera' : 'Añadir Nueva Carrera'}</DialogTitle>
          <DialogDescription>
             {isEditMode ? 'Modifica los detalles de la carrera.' : 'Completa el nombre y selecciona un ícono para la nueva carrera.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Carrera</FormLabel>
                <FormControl><Input placeholder="Ej: Ingeniería en Software" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
             <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícono de la Carrera</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un ícono..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconKeys.map((key) => {
                        const Icon = Icons[key];
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5" />
                              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading || !user}>
                {isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Carrera')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
