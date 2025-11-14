'use client';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemedLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // To prevent hydration mismatch and layout shift, render a placeholder.
    return <div style={{ width: 120, height: 40 }} />;
  }

  return (
    <Image 
      src={resolvedTheme === 'dark' ? '/logos/lbv_group_blanco.png' : '/logos/lbv_group_negro.png'}
      alt="LBV Group Logo"
      width={120}
      height={40}
    />
  );
}
