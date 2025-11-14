
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/types/user';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Users, Search, AlertCircle, Save, XCircle, Trash2, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';


async function fetchUsersFromClient(): Promise<{ users: UserProfile[], error?: string }> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as UserProfile));
    return { users };
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    if (error.code === 'permission-denied') {
        return { users: [], error: 'No tienes permisos para ver esta información. Asegúrate de haber iniciado sesión con una cuenta de Superadmin.' };
    }
    return { users: [], error: 'No se pudieron cargar los usuarios.' };
  }
}

type SortKey = 'nombre' | 'email' | 'role';
type SortDirection = 'asc' | 'desc';


export function UsersClient() {
  const { userProfile, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const [roleChanges, setRoleChanges] = useState<Record<string, UserProfile['role']>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadUsers() {
      if (userProfile?.role !== 'Superadmin') {
          setIsLoading(false);
          return;
      }
      const { users: fetchedUsers, error: fetchError } = await fetchUsersFromClient();
      if (fetchError) {
        setError(fetchError);
      } else {
        setUsers(fetchedUsers);
      }
      setIsLoading(false);
    }
    loadUsers();
  }, [userProfile]);

  const hasPendingChanges = Object.keys(roleChanges).length > 0;

  const handleRoleSelection = (uid: string, newRole: UserProfile['role']) => {
    const originalUser = users.find(u => u.uid === uid);
    if (!originalUser || !newRole) return;

    setRoleChanges(prev => {
        const newChanges = { ...prev };
        if (originalUser.role === newRole) {
            delete newChanges[uid];
        } else {
            newChanges[uid] = newRole;
        }
        return newChanges;
    });
  };
  
  const handleSaveChanges = async () => {
    if (!hasPendingChanges) return;

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    const changesToProcess = Object.entries(roleChanges);

    for (const [uid, newRole] of changesToProcess) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role: newRole });
            successCount++;
        } catch (error: any) {
            console.error(`Failed to update role for ${uid}:`, error);
            errorCount++;
        }
    }

    if (errorCount > 0) {
        toast({
            variant: 'destructive',
            title: 'Error al Guardar',
            description: `${errorCount} rol(es) no se pudieron actualizar. Revisa los permisos de Firestore.`,
        });
    }

    if (successCount > 0) {
        toast({
            title: 'Cambios Guardados',
            description: `${successCount} rol(es) han sido actualizados exitosamente.`,
        });
        setUsers(prevUsers => 
            prevUsers.map(u => 
                roleChanges[u.uid] ? { ...u, role: roleChanges[u.uid] } : u
            )
        );
    }

    setRoleChanges({});
    setIsSubmitting(false);
  };

  const handleDiscardChanges = () => {
    setRoleChanges({});
  };

  const openDeleteConfirm = (user: UserProfile) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', userToDelete.uid);
      await deleteDoc(userRef);
      toast({ title: 'Usuario Eliminado', description: `El usuario ${userToDelete.nombre} ha sido eliminado de la base de datos.` });
      setUsers(prev => prev.filter(u => u.uid !== userToDelete.uid));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el usuario.' });
      console.error("Error deleting user:", error);
    } finally {
      setIsConfirmOpen(false);
      setUserToDelete(null);
      setIsSubmitting(false);
    }
  };

  const getBadgeVariant = (role?: UserProfile['role']) => {
    switch (role) {
      case 'Superadmin':
        return 'destructive';
      case 'Admin':
        return 'default';
      case 'Estudiante':
        return 'secondary';
      default:
        return 'outline';
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

  const filteredAndSortedUsers = useMemo(() => {
    let sortedUsers = [...users];

    sortedUsers.sort((a, b) => {
        const valA = a[sortKey] || '';
        const valB = b[sortKey] || '';
        const comparison = valA.localeCompare(valB);
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    if (!searchQuery) {
      return sortedUsers;
    }
    return sortedUsers.filter(user =>
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery, sortKey, sortDirection]);
  
  const SortableHeader = ({ tKey, label, className }: { tKey: SortKey; label: string, className?: string }) => (
    <TableHead className={className}>
        <Button variant="ghost" onClick={() => handleSort(tKey)} className="px-0 h-auto font-bold text-muted-foreground hover:bg-transparent hover:text-foreground">
            {label}
            <ArrowUpDown className={cn("ml-2 h-4 w-4", sortKey !== tKey && "text-muted-foreground/50")} />
        </Button>
    </TableHead>
  );


  if (isLoading) {
     return <Skeleton className="h-96 w-full" />;
  }

  if (userProfile?.role !== 'Superadmin') {
    return (
       <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4">Acceso Denegado</CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground">
                No tienes los permisos necesarios para acceder a esta sección.
            </p>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
     return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                Visualiza, busca y asigna roles a los usuarios de la plataforma.
                </CardDescription>
            </div>
            {hasPendingChanges && (
                <div className="flex items-center gap-2 animate-in fade-in-50">
                    <Button onClick={handleSaveChanges} disabled={isSubmitting}>
                       <Save className="mr-2 h-4 w-4" />
                       {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button variant="ghost" onClick={handleDiscardChanges} disabled={isSubmitting}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Descartar
                    </Button>
                </div>
            )}
        </div>
         <div className="relative pt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-sm pl-9"
            />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader tKey="nombre" label="Nombre" />
                <SortableHeader tKey="email" label="Email" />
                <SortableHeader tKey="role" label="Rol Actual" />
                <TableHead className="w-[180px]">Cambiar Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.length > 0 ? (
                filteredAndSortedUsers.map(user => (
                  <TableRow key={user.uid} className={roleChanges[user.uid] ? 'bg-muted/50' : ''}>
                    <TableCell className="font-medium">{user.nombre}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(user.role)}>
                        {user.role || 'Sin rol'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={roleChanges[user.uid] || user.role}
                        onValueChange={(newRole: UserProfile['role']) => handleRoleSelection(user.uid, newRole)}
                        disabled={user.uid === currentUser?.uid || user.role === 'Superadmin'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Estudiante">Estudiante</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openDeleteConfirm(user)}
                          disabled={user.uid === currentUser?.uid || user.role === 'Superadmin'}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al usuario <span className="font-bold">"{userToDelete?.nombre}"</span> de la base de datos de la aplicación. 
              El usuario ya no podrá acceder a sus datos. Esta acción no elimina al usuario del sistema de autenticación de Firebase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                {isSubmitting ? 'Eliminando...' : 'Sí, eliminar usuario'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
