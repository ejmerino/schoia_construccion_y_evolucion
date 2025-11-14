'use client';

import { useState } from 'react';
import type { ContactSubmission } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mail, User, Tag, Calendar, MessageSquare, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteContactSubmission } from '@/lib/actions';

interface InboxClientProps {
  initialSubmissions: ContactSubmission[];
}

export function InboxClient({ initialSubmissions }: InboxClientProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const { toast } = useToast();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const isConfirmed = window.confirm('¿Estás seguro de que quieres eliminar este mensaje?');
    if (!isConfirmed) return;

    const result = await deleteContactSubmission(id);
    if (result.success) {
      toast({ title: 'Mensaje eliminado', description: 'El mensaje ha sido eliminado exitosamente.' });
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Bandeja de Entrada de Contacto</CardTitle>
        <CardDescription>
          Aquí se muestran los mensajes enviados a través del formulario de contacto del sitio web.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {submissions.map((submission) => (
              <AccordionItem value={submission.id} key={submission.id}>
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center gap-3 text-left">
                       <div className="hidden sm:block p-2 bg-secondary rounded-full">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                       </div>
                       <div className="flex-1 truncate">
                         <p className="font-medium truncate">{submission.subject}</p>
                         <p className="text-sm text-muted-foreground truncate">
                           De: {submission.name}
                         </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-muted-foreground whitespace-nowrap">
                         {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true, locale: es })}
                       </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><User className="h-4 w-4"/><span>{submission.name}</span></div>
                        <div className="flex items-center gap-2"><Mail className="h-4 w-4"/><span>{submission.email}</span></div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/><span>{new Date(submission.createdAt).toLocaleString('es-ES')}</span></div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground"/>
                        <Badge variant="secondary">{submission.subject}</Badge>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-4 mt-4">
                        <p className="whitespace-pre-wrap">{submission.message}</p>
                    </div>
                     <div className="flex justify-end pt-2">
                      <Button variant="destructive" size="sm" onClick={(e) => handleDelete(submission.id, e)}>
                        Eliminar Mensaje
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Alert>
            <Inbox className="h-4 w-4" />
            <AlertTitle>Bandeja Vacía</AlertTitle>
            <AlertDescription>No hay mensajes nuevos por el momento.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
