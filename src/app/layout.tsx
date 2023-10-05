import PrivateRoute from "@/routes/PrivateRoute";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/auth";
import { ModalManagerProvider } from "@/contexts/modalManager";

const inter = Inter({ subsets: ["latin"] });

const logoImage = "";

export const metadata: Metadata = {
  title: "Minha Rifa - Gerencie sua rifa online",
  description: "Seu gerenciador de rifas online.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    title: "Minha Rifa - Gerencie sua rifa online",
    description: "Seu gerenciador de rifas online.",
    siteName: "Minha Rifa - Gerencie sua rifa online",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    images: logoImage,
  },
  appleWebApp: {
    title: "Minha Rifa - Gerencie sua rifa online",
    startupImage: logoImage,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <ModalManagerProvider>
          <AuthProvider>
            <PrivateRoute>{children}</PrivateRoute>
          </AuthProvider>
        </ModalManagerProvider>
      </body>
    </html>
  );
}
