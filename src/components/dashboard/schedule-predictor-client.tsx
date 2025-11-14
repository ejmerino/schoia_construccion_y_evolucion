'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { predictCourseSchedule, PredictCourseScheduleOutput } from '@/ai/flows/predict-course-schedule';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bot, CalendarClock } from 'lucide-react';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  courseName: z.string().min(1, 'El nombre de la materia es requerido.'),
});

type FormValues = z.infer<typeof formSchema>;

export function SchedulePredictorClient() {
  const [prediction, setPrediction] = useState<PredictCourseScheduleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await predictCourseSchedule(values);
      setPrediction(result);
    } catch (error) {
      console.error('Error predicting schedule:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setPrediction(null);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock className="mr-2 h-4 w-4" />
          Predecir Horario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Predicción de Horario</DialogTitle>
          <DialogDescription>
            Usa IA para predecir cuándo se ofertará una materia. Ingresa el nombre de la materia.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="courseName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nombre de la Materia</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: Cálculo Vectorial" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Prediciendo...' : 'Predecir'}
                <Bot className="ml-2 h-4 w-4" />
                </Button>
            </form>
            </Form>

            {isLoading && <div className="mt-4 text-center">Analizando datos...</div>}
        
            {prediction && (
            <Card className="mt-6">
                <CardHeader>
                <CardTitle>Predicción para {form.getValues('courseName')}</CardTitle>
                <CardDescription>Resultado del análisis de IA:</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <p className="font-semibold">{prediction.predictedSchedule}</p>
                <div>
                    <Label>Confianza de la predicción: {Math.round(prediction.confidenceMeasure * 100)}%</Label>
                    <Progress value={prediction.confidenceMeasure * 100} className="mt-1" />
                </div>
                </CardContent>
            </Card>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
