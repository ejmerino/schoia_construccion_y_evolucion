
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UpdateNameForm } from './update-name-form';
import { UpdateEmailForm } from './update-email-form';
import { UpdatePasswordForm } from './update-password-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="container max-w-2xl mx-auto py-12">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }
    
    if (!user) {
        return (
             <div className="container max-w-2xl mx-auto py-24 text-center">
                 <Alert>
                    <LogIn className="h-4 w-4" />
                    <AlertTitle>Acceso denegado</AlertTitle>
                    <AlertDescription>
                        Debes <Link href="/login" className="font-bold underline hover:text-primary">iniciar sesión</Link> para ver tu perfil.
                    </AlertDescription>
                </Alert>
             </div>
        )
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 md:py-16">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground">Administra la información de tu cuenta.</p>
            </header>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nombre</CardTitle>
                            <CardDescription>Actualiza tu nombre para que se muestre correctamente en la plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UpdateNameForm currentName={userProfile?.nombre || user.displayName || ''} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="security" className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Correo Electrónico</CardTitle>
                            <CardDescription>Cambia la dirección de correo electrónico asociada a tu cuenta. Se te pedirá que vuelvas a iniciar sesión.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <UpdateEmailForm currentUser={user} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Contraseña</CardTitle>
                            <CardDescription>Actualiza tu contraseña. Por seguridad, se te pedirá tu contraseña actual.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <UpdatePasswordForm currentUser={user} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
