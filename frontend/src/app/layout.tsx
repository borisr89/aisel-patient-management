import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const geist = Geist({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Patient Management',
  description:
    'Aisel full-stack engineering assessment',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          {children}
          <Toaster
            richColors
            position="top-right"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
