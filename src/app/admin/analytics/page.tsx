
import { AnalyticsClient } from '@/components/admin/analytics-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { University, BookCopy, Users } from 'lucide-react';
import { getStats, getUserCount, getSubjectDifficultyStats } from '@/lib/data';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export default async function AnalyticsPage() {
    const statsData = await getStats();
    const userCount = await getUserCount();
    const subjectDifficultyData = await getSubjectDifficultyStats();

    const stats = [
        { title: 'Universidades', value: statsData.universityCount, icon: University, description: 'Total de universidades' },
        { title: 'Carreras', value: statsData.careerCount, icon: BookCopy, description: 'Total de carreras activas' },
        { title: 'Usuarios', value: userCount, icon: Users, description: 'Total de usuarios registrados' },
    ];

    return (
        <div className="flex-1 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Análisis Estadístico</h1>
                <p className="text-muted-foreground">Visualiza métricas y tendencias clave de la plataforma.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
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

            <AnalyticsClient subjectDifficultyData={subjectDifficultyData} />
        </div>
    );
}
