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
import type { University } from '@/types';
import { generateSlug } from '@/lib/utils';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

const universityFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  pais: z.string().min(3, 'El país debe tener al menos 3 caracteres.'),
  siglas: z.string().min(2, 'Las siglas deben tener al menos 2 caracteres.'),
});

type UniversityFormValues = z.infer<typeof universityFormSchema>;

interface UniversityFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
  initialData?: University | null;
}

export function UniversityForm({ isOpen, setIsOpen, onSuccess, initialData }: UniversityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!initialData;

  const form = useForm<UniversityFormValues>({
    resolver: zodResolver(universityFormSchema),
    defaultValues: {
      nombre: '',
      pais: '',
      siglas: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            form.reset(initialData);
        } else {
            form.reset({ nombre: '', pais: '', siglas: '' });
        }
    }
  }, [initialData, form, isOpen]);

  async function onSubmit(values: UniversityFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión.' });
        return;
    }
    setIsLoading(true);
    try {
      if (isEditMode) {
        const universityRef = doc(db, 'universidades', initialData!.id);
        await updateDoc(universityRef, values);
      } else {
        const id = generateSlug(values.siglas);
        const universityRef = doc(db, 'universidades', id);
        const docSnap = await getDoc(universityRef);
        if (docSnap.exists()) {
          throw new Error('Ya existe una universidad con estas siglas.');
        }
        await setDoc(universityRef, values);
      }

      toast({
        title: isEditMode ? 'Universidad Actualizada' : 'Universidad Añadida',
        description: `La universidad "${values.nombre}" ha sido ${isEditMode ? 'actualizada' : 'creada'} exitosamente.`,
      });
      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: isEditMode ? 'Error al actualizar' : 'Error al añadir',
        description: error.message || `No se pudo ${isEditMode ? 'actualizar' : 'crear'} la universidad.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Universidad' : 'Añadir Nueva Universidad'}</DialogTitle>
          <DialogDescription>
             {isEditMode ? 'Modifica los detalles de la universidad.' : 'Completa los detalles para la nueva universidad.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Universidad</FormLabel>
                <FormControl><Input placeholder="Ej: Universidad de las Fuerzas Armadas" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="siglas" render={({ field }) => (
              <FormItem>
                <FormLabel>Siglas</FormLabel>
                <FormControl><Input placeholder="Ej: ESPE" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="pais" render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl><Input placeholder="Ej: Ecuador" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading || !user}>
                {isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Universidad')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
