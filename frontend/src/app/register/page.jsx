'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?tab=register');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#F9F8F5' }} />
  );
}
