import type { Metadata } from "next";
import "./globals.css";

import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { AuthProvider } from "@/src/context/AuthContext";

export const metadata: Metadata = {
  title: "Homoeopathic Clinic - Natural Healing, Trusted Care",
  description:
    "Experience personalized homeopathic treatment tailored to your genetic blueprint.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Header />

          <main className="min-h-screen pt-20">
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
