'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const [showScroll, setShowScroll] = React.useState(true);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY < 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <section 
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black"
      data-ai-hint="planning students"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 z-0"
      >
        <source src="/videos/personas_planeando.mp4" type="video/mp4" />
      </video>
      <div className="relative z-20 text-center text-white p-4 space-y-6">
         <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
            Planifica tu ruta académica
          </h1>
          <p className="mx-auto max-w-[600px] text-lg text-gray-200" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
            Visualiza tu malla, planifica tus semestres y toma el control de tu carrera de forma interactiva.
          </p>
          <Link href="/universities">
            <Button size="lg" className="text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
              Explorar Universidades
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
      </div>
      <div className={`absolute bottom-10 z-20 text-white transition-opacity duration-500 ${showScroll ? 'opacity-100' : 'opacity-0'}`}>
        <ArrowDown className="h-8 w-8 animate-bounce" />
      </div>
    </section>
  );
}
