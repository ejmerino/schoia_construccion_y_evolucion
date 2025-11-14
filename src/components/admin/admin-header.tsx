'use client';

import Link from 'next/link';
import { LayoutDashboard, Database, BarChart, Users, Menu, LogOut, Settings, Home, Mail, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '../theme-toggle';
import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/management', label: 'Gestión', icon: Database },
  { href: '/admin/analytics', label: 'Análisis', icon: BarChart },
  { href: '/admin/users', label: 'Usuarios', icon: Users, role: 'Superadmin' },
  { href: '/admin/inbox', label: 'Bandeja de Entrada', icon: Mail, role: 'Superadmin' },
];

export function AdminHeader() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const visibleNavItems = navItems.filter(item => {
    if (!item.role) return true;
    if (userProfile?.role === 'Superadmin') return true;
    return item.role === userProfile?.role;
  });

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Icons.logo className="h-6 w-6 text-primary" />
              <span className="text-foreground">SchoIA+ Admin</span>
            </Link>
            {visibleNavItems.map((item) => (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname.startsWith(item.href) && item.href !== '/admin' ? 'bg-muted text-primary' : (pathname === '/admin' && item.href === '/admin' ? 'bg-muted text-primary' : 'text-muted-foreground')}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <div className="mt-auto">
             <SheetClose asChild>
                <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                    <Home className="h-4 w-4" />
                    Ver Sitio
                </Link>
             </SheetClose>
             <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="w-full flex-1" />
      
      <ThemeToggle />

      {user && (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ''} alt={userProfile?.nombre || ''} />
                  <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userProfile?.nombre}</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild>
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Ver Sitio</span>
                    </Link>
               </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      )}
    </header>
  );
}
