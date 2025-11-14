
"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, User as UserIcon, LayoutDashboard, Menu, Building2 } from "lucide-react"
import { signOut } from "firebase/auth"
import * as React from "react"

import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { auth } from "@/lib/firebase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Skeleton } from "../ui/skeleton"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/universities", label: "Universidades" },
  { href: "/contact", label: "Contacto" },
];

export function Header() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  
  const isHeroPage = pathname === '/' || pathname.startsWith('/careers') || pathname.startsWith('/dashboard');
  
  const myMallaHref = React.useMemo(() => {
    if (userProfile?.lastUniversityId && userProfile?.lastCareerId) {
      return `/dashboard?university=${userProfile.lastUniversityId}&career=${userProfile.lastCareerId}`;
    }
    return '/universities';
  }, [userProfile]);

  React.useEffect(() => {
    setMounted(true);
    
    if (!isHeroPage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll(); // Set initial state
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHeroPage, pathname]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };
  
  const showTransparentHeader = isHeroPage && !isScrolled;

  const headerClasses = cn(
    "fixed top-0 z-50 w-full transition-all duration-300",
    isScrolled 
      ? "border-b bg-background/95 backdrop-blur-sm" 
      : isHeroPage ? "bg-gradient-to-b from-black/60 to-transparent" : "bg-background"
  );
  
  const textContrastClass = showTransparentHeader ? "[text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]" : "";
  const iconContrastClass = showTransparentHeader ? "text-white [filter:drop-shadow(0_1px_2px_rgb(0_0_0_/_0.5))]" : "";

  const navLinkClasses = (href: string) => cn(
    "relative font-medium transition-colors duration-300",
    showTransparentHeader
      ? (pathname === href ? "text-white" : "text-white/80 hover:text-white")
      : (pathname === href ? "text-primary" : "text-foreground/70 hover:text-foreground/90"),
    textContrastClass
  );

  const activeIndicatorClasses = (href: string) => cn(
      "absolute -bottom-1.5 left-0 block h-[2px] w-full origin-center transform transition-transform duration-300",
      pathname === href ? 'scale-x-100' : 'scale-x-0',
      showTransparentHeader ? 'bg-white' : 'bg-primary'
  );

  if (!mounted) {
    return (
      <header className={cn('fixed top-0 z-50 w-full', 'bg-background border-b')}>
        <div className="container flex h-16 items-center">
            <Skeleton className="h-6 w-24" />
             <div className="hidden flex-1 items-center justify-end space-x-2 md:flex">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-10 rounded-full" />
             </div>
             <div className="md:hidden flex flex-1 justify-end">
                <Skeleton className="h-10 w-10" />
             </div>
        </div>
      </header>
    );
  }

  return (
    <header className={headerClasses}>
      <div className="container flex h-16 items-center">
        <Link href="/" className={cn("mr-6 flex items-center space-x-2", showTransparentHeader ? "text-white" : "text-foreground")}>
          <Icons.logo className={cn("h-6 w-6", iconContrastClass)} />
          <span className={cn("font-bold", textContrastClass)}>SchoIA+</span>
        </Link>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClasses(link.href)}
            >
              {link.label}
              <span className={activeIndicatorClasses(link.href)} />
            </Link>
          ))}
          {user && (
             <Link href={myMallaHref} className={navLinkClasses("/dashboard")}>
                Mi Malla
               <span className={activeIndicatorClasses("/dashboard")} />
             </Link>
          )}
          {(userProfile?.role === "Superadmin" || userProfile?.role === "Admin") && (
            <Link href="/admin" className={cn("transition-colors font-semibold", showTransparentHeader ? "text-white hover:text-white/90" : "text-primary hover:text-primary/90", textContrastClass)}>Admin</Link>
          )}
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
           <ThemeToggle className={cn(showTransparentHeader ? "text-white hover:bg-white/10" : "", iconContrastClass)} />
          
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant={showTransparentHeader ? 'ghost' : 'secondary'} size="icon" className={cn("rounded-full", showTransparentHeader && 'hover:bg-white/10', iconContrastClass)}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} alt={userProfile?.nombre || ''} />
                      <AvatarFallback className="bg-transparent"><UserIcon /></AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile?.nombre}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={myMallaHref}><LayoutDashboard className="mr-2 h-4 w-4" /> Mi Malla</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /> Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default" className={cn(showTransparentHeader && "bg-white/90 text-neutral-900 hover:bg-white")}>Acceder</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(showTransparentHeader ? "text-white hover:bg-white/10 hover:text-white" : "", iconContrastClass)}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                   <SheetTitle className="sr-only">Menú Principal</SheetTitle>
                   <SheetDescription className="sr-only">Navegación principal del sitio.</SheetDescription>
                  <SheetClose asChild>
                    <Link href="/" className="flex items-center space-x-2">
                      <Icons.logo className="h-6 w-6 text-primary" />
                      <span className="font-bold">SchoIA+</span>
                    </Link>
                  </SheetClose>
                </SheetHeader>
                
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col space-y-1">
                      {navLinks.map(link => (
                         <SheetClose asChild key={link.href}>
                          <Link 
                            href={link.href} 
                            className={cn(
                              "rounded-md px-3 py-2 text-lg font-medium transition-colors hover:text-primary",
                              pathname === link.href ? "text-primary bg-secondary" : "text-foreground/70"
                            )}
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      ))}
                      {user && (
                         <SheetClose asChild>
                          <Link 
                            href={myMallaHref}
                            className={cn(
                              "rounded-md px-3 py-2 text-lg font-medium transition-colors hover:text-primary",
                              pathname === "/dashboard" ? "text-primary bg-secondary" : "text-foreground/70"
                            )}
                          >
                            Mi Malla
                          </Link>
                        </SheetClose>
                      )}
                      {(userProfile?.role === "Superadmin" || userProfile?.role === "Admin") && (
                         <SheetClose asChild>
                          <Link href="/admin" className="rounded-md px-3 py-2 text-lg font-bold text-primary transition-colors hover:text-primary/80">Admin</Link>
                         </SheetClose>
                      )}
                  </div>
                </nav>

                <div className="mt-auto border-t p-4">
                   {loading ? (
                      <div className="flex items-center gap-3">
                         <Skeleton className="h-9 w-9 rounded-full" />
                         <div className="flex flex-col gap-1 w-full">
                           <Skeleton className="h-4 w-3/4" />
                           <Skeleton className="h-3 w-full" />
                         </div>
                      </div>
                    ) : user ? (
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.photoURL || ''} alt={userProfile?.nombre || ''} />
                              <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col truncate">
                              <span className="text-sm font-medium">{userProfile?.nombre}</span>
                              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <SheetClose asChild>
                                <Link href={myMallaHref} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Mi Malla</span>
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/profile" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                    <UserIcon className="h-4 w-4" />
                                    <span>Perfil</span>
                                </Link>
                             </SheetClose>
                            <SheetClose asChild>
                                <button onClick={handleLogout} className="flex w-full text-left items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                   <LogOut className="h-4 w-4" />
                                   <span>Cerrar Sesión</span>
                                </button>
                            </SheetClose>
                        </div>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Button asChild className="w-full">
                          <Link href="/login">Acceder</Link>
                        </Button>
                      </SheetClose>
                    )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
