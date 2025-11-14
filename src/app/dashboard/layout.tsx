'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  // The dashboard is now public, but we might still want a loading state
  // while firebase auth initializes to avoid flashes of content.
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
        </div>
        <Skeleton className="mt-8 h-96 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
