'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzeCourseDifficulty, AnalyzeCourseDifficultyOutput } from '@/ai/flows/analyze-course-difficulty';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bot, Lightbulb, ThumbsDown, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  courseCode: z.string().min(1, 'El código de la materia es requerido.'),
});

type FormValues = z.infer<typeof formSchema>;

export function DifficultyAnalyzerClient() {
  const [analysis, setAnalysis] = useState<AnalyzeCourseDifficultyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCode: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setAnalysis(null);
    setError(null);
    try {
      const result = await analyzeCourseDifficulty(values);
      setAnalysis(result);
    } catch (e: any) {
      console.error('Error analyzing difficulty:', e);
      setError('No se pudo completar el análisis. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          Análisis de Dificultad de Materia
        </CardTitle>
        <CardDescription>Usa IA para analizar la dificultad de una materia basado en datos simulados.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courseCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Materia</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: ICC-301" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              {isLoading ? 'Analizando...' : 'Analizar Dificultad'}
            </Button>
          </form>
        </Form>
        
        {analysis && (
          <div className="mt-6 space-y-4 animate-in fade-in-50 duration-500">
            <h3 className="font-semibold text-lg">Resultados para {form.getValues('courseCode')}:</h3>
            <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="text-3xl font-bold text-primary">{analysis.difficultyScore}/10</div>
                <div className="text-sm text-muted-foreground">Nivel de Dificultad</div>
            </div>
            
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><ThumbsDown className="h-4 w-4 text-destructive"/>Razones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                  </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500"/>Sugerencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                  </ul>
                </CardContent>
            </Card>
          </div>
        )}
        
        {error && (
            <Alert variant="destructive" className="mt-6">
                <AlertTitle>Error de Análisis</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
