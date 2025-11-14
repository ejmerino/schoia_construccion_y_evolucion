
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DialogFooter } from '@/components/ui/dialog';

const formSchema = z.object({
  password: z.string().min(1, 'La contraseña es requerida.'),
});

type FormValues = z.infer<typeof formSchema>;

interface ReauthenticateFormProps {
  user: User;
  onSuccess: (password: string) => void;
  isSubmitting: boolean;
}

export function ReauthenticateForm({ user, onSuccess, isSubmitting }: ReauthenticateFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '' },
  });

  const handleSubmit = (values: FormValues) => {
    onSuccess(values.password);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña Actual</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verificando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
