'use client';

import { AdminAuthGuard } from '../admin-auth-guard';
import { UsersClient } from './users-client';

export default function UsersPage() {
  return (
    <AdminAuthGuard>
      <UsersClient />
    </AdminAuthGuard>
  );
}
