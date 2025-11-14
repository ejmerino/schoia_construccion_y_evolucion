
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Materia } from '@/types';
import { SubjectForm } from './subject-form';
import { PlusCircle, Edit, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SortKey = 'nombre' | 'codigo' | 'semestre' | 'creditos';
type SortDirection = 'asc' | 'desc';

interface MateriasClientProps {
  initialMaterias: Materia[];
  careerId: string;
  universityId: string;
  onDataChange: () => void;
  semesterFilter: string;
  setSemesterFilter: (value: string) => void;
}

export function MateriasClient({ 
  initialMaterias, 
  careerId, 
  universityId, 
  onDataChange,
  semesterFilter,
  setSemesterFilter
}: MateriasClientProps) {
  const [materias, setMaterias] = useState<Materia[]>(initialMaterias);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Materia | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Materia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('semestre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();
  const { user } = useAuth();
  
  const semesters = useMemo(() => {
    const semesterSet = new Set(initialMaterias.map(m => m.semestre));
    return ['all', ...Array.from(semesterSet).sort((a,b) => a - b).map(String)];
  }, [initialMaterias]);
  
  useEffect(() => {
    setMaterias(initialMaterias);
  }, [initialMaterias]);

  const handleSuccess = () => {
    onDataChange();
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  const openEditForm = (materia: Materia) => {
    setEditingSubject(materia);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (materia: Materia) => {
    setSubjectToDelete(materia);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!subjectToDelete || !user) return;
    try {
        const subjectRef = doc(db, 'universidades', universityId, 'carreras', careerId, 'materias', subjectToDelete.id);
        await deleteDoc(subjectRef);
        toast({ title: 'Materia Eliminada', description: `La materia "${subjectToDelete.nombre}" fue eliminada.` });
        onDataChange();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar: ${error.message}` });
    } finally {
        setIsConfirmOpen(false);
        setSubjectToDelete(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const filteredAndSortedMaterias = useMemo(() => {
    let filtered = [...materias];
    
    if (semesterFilter !== 'all') {
      filtered = filtered.filter(m => m.semestre.toString() === semesterFilter);
    }

    if (searchQuery) {
        filtered = filtered.filter(m => 
            m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.codigo.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    filtered.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [materias, semesterFilter, searchQuery, sortKey, sortDirection]);

  const SortableHeader = ({ tKey, label }: { tKey: SortKey; label: string }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => handleSort(tKey)} className="px-2 py-1 h-auto">
            {label}
            <ArrowUpDown className={cn("ml-2 h-4 w-4", sortKey !== tKey && "text-muted-foreground/50")} />
        </Button>
    </TableHead>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Materias</CardTitle>
              <CardDescription>Añade, edita o elimina las materias de la carrera seleccionada.</CardDescription>
            </div>
            <Button onClick={() => { setEditingSubject(null); setIsFormOpen(true); }} disabled={!user}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Materia
            </Button>
          </div>
           <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o código..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9"
                />
              </div>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrar por semestre" />
                  </SelectTrigger>
                  <SelectContent>
                      {semesters.map(s => (
                          <SelectItem key={s} value={s}>
                              {s === 'all' ? 'Todos los semestres' : `Semestre ${s}`}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader tKey="nombre" label="Nombre" />
                  <SortableHeader tKey="codigo" label="Código" />
                  <SortableHeader tKey="semestre" label="Semestre" />
                  <SortableHeader tKey="creditos" label="Créditos" />
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedMaterias.length > 0 ? (
                  filteredAndSortedMaterias.map((materia) => (
                      <TableRow key={materia.id}>
                        <TableCell className="font-medium">{materia.nombre}</TableCell>
                        <TableCell>{materia.codigo}</TableCell>
                        <TableCell>{materia.semestre}</TableCell>
                        <TableCell>{materia.creditos}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(materia)} disabled={!user}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(materia)} disabled={!user}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay materias que coincidan con tu búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SubjectForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={handleSuccess}
        universityId={universityId}
        careerId={careerId}
        allMaterias={initialMaterias}
        initialData={editingSubject}
      />

       <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la materia
              <span className="font-bold"> "{subjectToDelete?.nombre}"</span>.
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
