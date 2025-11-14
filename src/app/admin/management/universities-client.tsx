'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { University } from '@/types';
import { UniversityForm } from './university-form';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

interface UniversitiesClientProps {
  initialUniversities: University[];
  onDataChange: () => void;
}

export function UniversitiesClient({ initialUniversities, onDataChange }: UniversitiesClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFormSuccess = () => {
    onDataChange();
    setIsFormOpen(false);
    setEditingUniversity(null);
  };

  const openEditForm = (university: University) => {
    setEditingUniversity(university);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (university: University) => {
    setUniversityToDelete(university);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!universityToDelete) return;

    try {
        const universityRef = doc(db, 'universidades', universityToDelete.id);
        const careersSnapshot = await getDocs(collection(universityRef, 'carreras'));
        
        const batch = writeBatch(db);

        for (const careerDoc of careersSnapshot.docs) {
          const subjectsSnapshot = await getDocs(collection(careerDoc.ref, 'materias'));
          subjectsSnapshot.docs.forEach(subjectDoc => batch.delete(subjectDoc.ref));
          batch.delete(careerDoc.ref);
        }
        
        batch.delete(universityRef);
        await batch.commit();

        toast({ title: 'Universidad Eliminada', description: `La universidad "${universityToDelete.nombre}" fue eliminada.` });
        onDataChange(); // Refresh data
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar la universidad: ${error.message}` });
    } finally {
        setIsConfirmOpen(false);
        setUniversityToDelete(null);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Universidades</CardTitle>
              <CardDescription>Añade, edita o elimina las universidades de la plataforma.</CardDescription>
            </div>
            <Button onClick={() => { setEditingUniversity(null); setIsFormOpen(true); }} disabled={!user}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Universidad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Siglas</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialUniversities.length > 0 ? (
                  initialUniversities.map((uni) => (
                      <TableRow key={uni.id}>
                        <TableCell className="font-medium">{uni.nombre}</TableCell>
                        <TableCell>{uni.siglas}</TableCell>
                        <TableCell>{uni.pais}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(uni)} disabled={!user}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(uni)} disabled={!user}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay universidades para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <UniversityForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={handleFormSuccess}
        initialData={editingUniversity}
      />
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la universidad
              <span className="font-bold"> "{universityToDelete?.nombre}"</span> y todas sus carreras y materias asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
