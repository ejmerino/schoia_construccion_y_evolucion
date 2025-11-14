
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  User,
  signOut,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReauthenticateForm } from './reauthenticate-form';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido.'),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateEmailFormProps {
  currentUser: User;
}

export function UpdateEmailForm({ currentUser }: UpdateEmailFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isReauthDialogOpen, setIsReauthDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: currentUser.email || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    if (values.email === currentUser.email) {
      toast({ title: 'Sin cambios', description: 'El nuevo correo es igual al actual.' });
      return;
    }
    setNewEmail(values.email);
    setIsReauthDialogOpen(true);
  };

  const handleReauthentication = async (password: string) => {
    setIsLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email!, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Re-authentication successful, now update email
      await updateEmail(currentUser, newEmail);
      
      // Update email in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { email: newEmail });

      toast({
        title: 'Correo actualizado',
        description: 'Tu correo ha sido cambiado. Por favor, inicia sesión de nuevo.',
      });
      
      // Force sign out and redirect to login
      await signOut(auth);
      router.push('/login');

    } catch (error: any) {
        let description = 'Ocurrió un error inesperado.';
        if (error.code === 'auth/wrong-password') {
            description = 'La contraseña es incorrecta.';
        } else if (error.code === 'auth/email-already-in-use') {
            description = 'Este correo electrónico ya está registrado por otro usuario.';
        }
        toast({ variant: 'destructive', title: 'Error', description });
    } finally {
        setIsLoading(false);
        setIsReauthDialogOpen(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nuevo Correo Electrónico</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            Actualizar Correo
          </Button>
        </form>
      </Form>

      <Dialog open={isReauthDialogOpen} onOpenChange={setIsReauthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar Identidad</DialogTitle>
            <DialogDescription>
              Por seguridad, ingresa tu contraseña actual para confirmar el cambio de correo electrónico.
            </DialogDescription>
          </DialogHeader>
          <ReauthenticateForm
            user={currentUser}
            onSuccess={handleReauthentication}
            isSubmitting={isLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
