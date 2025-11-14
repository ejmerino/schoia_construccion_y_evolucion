
'use client';

import { BarChart as BarChartIcon, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Placeholder Data ---
const userRegistrationsData = [
  { month: 'Enero', users: 12 },
  { month: 'Febrero', users: 19 },
  { month: 'Marzo', users: 32 },
  { month: 'Abril', users: 45 },
  { month: 'Mayo', users: 38 },
  { month: 'Junio', users: 51 },
];

const careerPopularityData = [
  { name: 'Software', students: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Mecatrónica', students: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Biotecnología', students: 278, fill: 'hsl(var(--chart-3))' },
  { name: 'Administración', students: 189, fill: 'hsl(var(--chart-4))' },
  { name: 'Otras', students: 239, fill: 'hsl(var(--chart-5))' },
];
// --- End Placeholder Data ---


export function AnalyticsClient({ subjectDifficultyData }: { subjectDifficultyData: any[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Registros de Usuarios</CardTitle>
          <CardDescription>Nuevos usuarios por mes (datos de ejemplo).</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-72 w-full">
             <ResponsiveContainer>
                 <BarChart data={userRegistrationsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                 </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5" />Popularidad de Carreras</CardTitle>
          <CardDescription>Distribución de estudiantes por carrera (datos de ejemplo).</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
           <ChartContainer config={{}} className="h-64 aspect-square">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideIndicator />} />
                    <Pie data={careerPopularityData} dataKey="students" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                         {careerPopularityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
             </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChartIcon className="h-5 w-5" />Dificultad de Materias</CardTitle>
          <CardDescription>Materias clasificadas por su dificultad (datos reales).</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64 w-full">
            <ResponsiveContainer>
                <BarChart data={subjectDifficultyData} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} fontSize={12} width={60} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                         {subjectDifficultyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  );
}
