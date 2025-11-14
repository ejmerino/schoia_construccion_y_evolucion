'use client';

import type { ReactNode } from 'react';
import { AdminAuthGuard } from './admin-auth-guard';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
        <AdminSidebar />
        <div className="flex flex-col">
          <AdminHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
