import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { AuthProvider } from '@/src/context/AuthContext';
import { UserAuthProvider } from '@/src/context/UserAuthContext';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Homoeopathic Clinic - Natural Healing, Trusted Care',
  description: 'Experience personalized homeopathic treatment tailored to your genetic blueprint.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <UserAuthProvider>
          <Header />
          <main className="pt-20 min-h-screen">
            {children}
          </main>
          <Footer />
          </UserAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}