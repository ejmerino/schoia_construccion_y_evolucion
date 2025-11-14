'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from '@/lib/actions';
import { Send, Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Por favor ingresa un correo electrónico válido.'),
  subject: z.string(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const result = await submitContactForm(values);
      if (result.success) {
        toast({
          title: 'Mensaje Enviado',
          description: 'Gracias por contactarnos. Nos pondremos en contacto contigo pronto.',
        });
        form.reset();
      } else {
        throw new Error(result.error || 'Algo salió mal');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al enviar el mensaje',
        description: error.message || 'Por favor, inténtalo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Ponte en Contacto</h1>
          <p className="text-lg text-muted-foreground">
            ¿Tienes alguna pregunta, sugerencia o quieres reportar un error? Estamos aquí para ayudarte.
            Completa el formulario y nuestro equipo se pondrá en contacto contigo lo antes posible.
          </p>
           <div className="space-y-2 text-muted-foreground">
             <p>
                Este formulario es para consultas, sugerencias o reporte de errores sobre la plataforma.
             </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Envíanos un Mensaje</CardTitle>
            <CardDescription>Responderemos a tu correo a la brevedad posible.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl><Input placeholder="Tu nombre" {...field} /></FormControl>
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
                      <FormControl><Input type="email" placeholder="tu@correo.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asunto</FormLabel>
                      <FormControl><Input placeholder="Asunto del mensaje" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje</FormLabel>
                      <FormControl><Textarea placeholder="Escribe tu mensaje aquí..." {...field} rows={5} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
