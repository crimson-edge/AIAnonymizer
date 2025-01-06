'use client';

import { useEffect, useState } from 'react';
import { prisma } from '@/lib/prisma';

interface Props {
  email: string;
  children: (isAdmin: boolean) => React.ReactNode;
}

export default function ClientComponent({ email, children }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check-status');
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [email]);

  return <>{children(isAdmin)}</>;
}
