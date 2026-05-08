'use client';

import { AuthProvider } from '@/context/auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
