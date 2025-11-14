'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { CareerInfo } from '@/types';
import { CareerForm } from './career-form';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import type { UserProfile } from '@/types/user';
import { useAuth } from '@/hooks/use-auth';
import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CareersClientProps {
  initialCareers: CareerInfo[];
  universityId: string;
  role?: UserProfile['role'];
  onDataChange: () => void;
}

export function CareersClient({ initialCareers, universityId, role, onDataChange }: CareersClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<CareerInfo | null>(null);
  const [careerToDelete, setCareerToDelete] = useState<CareerInfo | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFormSuccess = () => {
    onDataChange();
    setIsFormOpen(false);
    setEditingCareer(null);
  };

  const openEditForm = (career: CareerInfo) => {
    setEditingCareer(career);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (career: CareerInfo) => {
    setCareerToDelete(career);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!careerToDelete) return;
    try {
        const careerRef = doc(db, 'universidades', universityId, 'carreras', careerToDelete.id);
        const materiasCol = collection(careerRef, 'materias');
        const materiasSnapshot = await getDocs(materiasCol);
        
        const batch = writeBatch(db);
        if (!materiasSnapshot.empty) {
            materiasSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        batch.delete(careerRef);
        await batch.commit();
        toast({ title: 'Carrera Eliminada', description: `La carrera "${careerToDelete.nombre}" fue eliminada.` });
        onDataChange();

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar: ${error.message}` });
    }
    setIsConfirmOpen(false);
    setCareerToDelete(null);
  };
  
  const IconComponent = ({ logoName }: { logoName?: string }) => {
    const iconKey = logoName || 'bookCopy';
    const Icon = (Icons as any)[iconKey] || Icons.bookCopy;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Carreras</CardTitle>
              <CardDescription>Añade, edita o elimina las carreras de la universidad. El ícono se asigna automáticamente.</CardDescription>
            </div>
            <Button onClick={() => { setEditingCareer(null); setIsFormOpen(true); }} disabled={!user}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Carrera
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ícono</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialCareers.length > 0 ? (
                  initialCareers.map((career) => (
                      <TableRow key={career.id}>
                        <TableCell><IconComponent logoName={career.logo} /></TableCell>
                        <TableCell className="font-medium">{career.nombre}</TableCell>
                        <TableCell className="font-mono text-xs">{career.id}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(career)} disabled={!user}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          {role === 'Superadmin' && (
                            <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(career)} disabled={!user}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay carreras para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <CareerForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={handleFormSuccess}
        universityId={universityId}
        initialData={editingCareer}
      />
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la carrera
              <span className="font-bold"> "{careerToDelete?.nombre}"</span> y todas sus materias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
