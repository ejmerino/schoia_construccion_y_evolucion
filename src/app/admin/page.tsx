
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { University, BookCopy, GraduationCap, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { getStats, getRecentUsers } from '@/lib/data';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/types/user';

type Stats = {
  universityCount: number;
  careerCount: number;
  subjectCount: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserProfile[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsData, usersData] = await Promise.all([
          getStats(),
          getRecentUsers(5)
        ]);
        setStats(statsData);
        setRecentUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statsCards = [
    { title: 'Universidades', value: stats?.universityCount ?? 0, icon: University, description: 'Total de universidades' },
    { title: 'Carreras', value: stats?.careerCount ?? 0, icon: BookCopy, description: 'Total de carreras activas' },
    { title: 'Materias', value: stats?.subjectCount ?? 0, icon: GraduationCap, description: 'Total de materias cargadas' },
  ];

  if (loading) {
    return (
        <div className="flex-1 space-y-6">
             <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-1 lg:col-span-4 h-72" />
                <Skeleton className="col-span-1 lg:col-span-3 h-72" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Un resumen del estado de la plataforma académica.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                 <AnimatedCounter value={stat.value} />
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Nuevos Usuarios</span>
               <Link href="/admin/users">
                  <Button variant="ghost" size="sm">Ver todo</Button>
               </Link>
            </CardTitle>
            <CardDescription>Últimos registros en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUsers && recentUsers.length > 0 ? recentUsers.map((user) => (
              <div key={user.uid} className="flex items-start gap-4">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={(user as any).photoURL || ''} alt={user.nombre || ''} />
                    <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">
                    <span className="font-bold">{user.nombre}</span>
                  </p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <p className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                   {user.createdAt ? formatDistanceToNow(new Date(user.createdAt.seconds * 1000), { addSuffix: true, locale: es }) : 'Fecha desconocida'}
                </p>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente.</p>}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
           <CardHeader>
            <CardTitle>Acceso Rápido</CardTitle>
            <CardDescription>Gestión de contenido académico.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/management?tab=universities" className="w-full">
              <Button className="w-full justify-start" variant="secondary">Añadir Universidad</Button>
            </Link>
            <Link href="/admin/management?tab=careers" className="w-full">
              <Button className="w-full justify-start" variant="secondary">Añadir Carrera</Button>
            </Link>
            <Link href="/admin/management?tab=materias" className="w-full">
              <Button className="w-full justify-start" variant="secondary">Añadir Materia</Button>
            </Link>
            <Link href="/admin/management" className="w-full">
              <Button className="w-full mt-4">Gestionar Contenido</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
