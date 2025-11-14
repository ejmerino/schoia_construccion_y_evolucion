'use client';

import { Icons } from '@/components/icons';
import { Search, BrainCircuit } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function FeaturesSection() {
    const features = [
        {
            icon: <Icons.interactiveGrid className="w-10 h-10 text-primary" />,
            title: "Malla Interactiva",
            description: "Selecciona materias, visualiza prerrequisitos y controla tu progreso de forma dinámica."
        },
        {
            icon: <Search className="w-10 h-10 text-primary" />,
            title: "Información Detallada",
            description: "Encuentra datos clave sobre cada materia, incluyendo horarios y dificultad estimada."
        },
        {
            icon: <BrainCircuit className="w-10 h-10 text-primary" />,
            title: "Asistente con IA (Próximamente)",
            description: "Obtén predicciones de horarios y análisis de dificultad para planificar tus semestres con ventaja."
        }
    ];

    return (
        <section id="features" className="relative w-full bg-secondary py-16 md:py-24 overflow-hidden">
             <div className="absolute inset-0 z-0">
                <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        opacity: 0.5
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary/80 to-secondary" />
            </div>
            <div className="container relative z-10 mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Herramientas para tu éxito académico</h2>
                <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mb-12">
                    Nuestra plataforma combina una interfaz intuitiva con herramientas poderosas para simplificar tu vida estudiantil.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <Card key={feature.title} className="flex flex-col items-center p-6 text-center space-y-4 bg-card/80 backdrop-blur-sm border-border/50">
                            {feature.icon}
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
