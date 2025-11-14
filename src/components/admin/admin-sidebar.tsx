'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Database, BarChart, LogOut, Users, Home, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/management', label: 'Gestión', icon: Database },
    { href: '/admin/analytics', label: 'Análisis', icon: BarChart },
    { href: '/admin/users', label: 'Usuarios', icon: Users, role: 'Superadmin' },
    { href: '/admin/inbox', label: 'Bandeja de Entrada', icon: Mail, role: 'Superadmin' },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (!item.role) return true;
    if (userProfile?.role === 'Superadmin') return true;
    return item.role === userProfile?.role;
  });

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r">
      <div className="flex items-center justify-between h-16 border-b px-4">
         <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="text-foreground">SchoIA+ Admin</span>
        </Link>
      </div>
      <div className="p-4">
        {user && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || ''} alt={userProfile?.nombre || ''} />
                  <AvatarFallback><UserIcon className="h-6 w-6" /></AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                  <span className="text-sm font-medium truncate">Bienvenido,</span>
                  <span className="text-sm text-muted-foreground truncate">{userProfile?.nombre?.split(' ')[0]}</span>
              </div>
            </div>
        )}
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {visibleNavItems.map((item) => (
          <Link href={item.href} key={item.label}>
            <Button
              variant={pathname.startsWith(item.href) && item.href !== '/admin' ? 'secondary' : (pathname === '/admin' && item.href === '/admin' ? 'secondary' : 'ghost')}
              className="w-full justify-start gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
        <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-2 mb-2">
                <Home className="h-4 w-4" />
                <span>Ver Sitio</span>
            </Button>
        </Link>
         <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
        </Button>
      </div>
    </aside>
  );
}
