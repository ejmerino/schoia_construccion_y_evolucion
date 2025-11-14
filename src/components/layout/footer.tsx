import { Icons } from "@/components/icons";
import { Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';
import { ThemedLogo } from "./themed-logo";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export function Footer() {
  return (
    <footer id="contacto" className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-2 md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
             <Link href="/" className="flex items-center space-x-2">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl text-foreground">SchoIA+</span>
             </Link>
             <p className="mt-4 max-w-sm text-muted-foreground">
                Una herramienta creada por y para estudiantes.
             </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
             <h3 className="font-semibold text-foreground mb-4">Apóyanos</h3>
             <p className="text-muted-foreground text-sm mb-4 text-center md:text-right">
               Si la plataforma te es útil, considera apoyar nuestro desarrollo para mantenerla gratuita y sin anuncios.
             </p>
             <div className="flex space-x-2">
               <Button variant="outline" size="sm" asChild>
                   <a href="#" target="_blank" rel="noopener noreferrer">PayPal</a>
               </Button>
               <Button variant="outline" size="sm" asChild>
                   <a href="https://cafecito.app/schoia" target="_blank" rel="noopener noreferrer">Cafecito</a>
               </Button>
             </div>
          </div>
        </div>

        <Separator className="my-8" />
        
        <div className="flex flex-col-reverse items-center gap-6 md:flex-row md:justify-between">
           <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SchoIA+. Desarrollado por</p>
              <a href="https://lbv-group.com" target="_blank" rel="noopener noreferrer">
                  <ThemedLogo />
              </a>
          </div>
          <div className="flex space-x-4 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors"><span className="sr-only">Instagram</span><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
