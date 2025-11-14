
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.344-11.303-8H6.306C9.656,39.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,35.636,44,30.413,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor ingresa un correo válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  confirmPassword: z.string().min(6, { message: 'La confirmación debe tener al menos 6 caracteres.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const PasswordRequirement = ({ isValid, children }: { isValid: boolean, children: React.ReactNode }) => (
    <div className={cn("flex items-center text-sm", isValid ? "text-green-600" : "text-muted-foreground")}>
        {isValid ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2 text-destructive" />}
        <span>{children}</span>
    </div>
);

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch("password");

  const passwordChecks = useMemo(() => {
    const value = passwordValue || "";
    return {
        hasLower: /[a-z]/.test(value),
        hasUpper: /[A-Z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[^A-Za-z0-9]/.test(value),
        isLongEnough: value.length >= 6,
    };
  }, [passwordValue]);


  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                nombre: user.displayName,
                email: user.email,
                role: 'Estudiante',
                createdAt: serverTimestamp()
            });
            toast({
                title: '¡Cuenta Creada con Google!',
                description: 'Bienvenido/a. Para empezar, elige tu universidad.',
            });
        } else {
             toast({
                title: '¡Sesión Iniciada con Google!',
                description: `Bienvenido/a de nuevo, ${user.displayName}.`,
            });
        }
        router.push('/universities');

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error de autenticación',
            description: error.message || 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
        });
        console.error(error);
    } finally {
        setIsGoogleLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.nombre,
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        nombre: values.nombre,
        email: values.email,
        role: 'Estudiante',
        createdAt: serverTimestamp(),
      });

      toast({
        title: '¡Cuenta Creada!',
        description: 'Bienvenido/a. Para empezar, elige tu universidad.',
      });

      router.push('/universities');
    } catch (error: any) {
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este correo electrónico ya está en uso. Por favor, intenta con otro.';
      } else if (error.code === 'auth/weak-password') {
          description = 'La contraseña no cumple con los requisitos de seguridad. Por favor, revisa las indicaciones.';
      }
      toast({
        variant: 'destructive',
        title: 'Error al registrarse',
        description,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Icons.logo className="h-12 w-12 text-primary" />
            </div>
          <CardTitle>Crear una Cuenta</CardTitle>
          <CardDescription>Regístrate para empezar a planificar tu futuro académico.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre y apellido" {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@correo.com" {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {passwordValue && (
                  <div className="p-3 bg-muted rounded-lg grid grid-cols-2 gap-x-4 gap-y-2 animate-in fade-in-50">
                      <PasswordRequirement isValid={passwordChecks.isLongEnough}>Mínimo 6 caracteres</PasswordRequirement>
                      <PasswordRequirement isValid={passwordChecks.hasLower}>Una minúscula</PasswordRequirement>
                      <PasswordRequirement isValid={passwordChecks.hasUpper}>Una mayúscula</PasswordRequirement>
                      <PasswordRequirement isValid={passwordChecks.hasNumber}>Un número</PasswordRequirement>
                      <PasswordRequirement isValid={passwordChecks.hasSpecial}>Un caracter especial</PasswordRequirement>
                  </div>
              )}

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full">
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </Form>
           <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
              </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2 h-5 w-5" />
             )}
              {isGoogleLoading ? 'Registrando...' : 'Registrarse con Google'}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
