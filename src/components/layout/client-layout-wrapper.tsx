'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isHeroPage = pathname === '/' || pathname.startsWith('/careers') || pathname.startsWith('/dashboard');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {isAdminRoute ? (
          <>{children}</>
        ) : (
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className={cn('flex-1', !isHeroPage && 'pt-16')}>{children}</main>
            <Footer />
          </div>
        )}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
