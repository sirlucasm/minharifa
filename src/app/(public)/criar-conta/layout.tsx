import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Rifa - Gerencie sua rifa online",
  description: "Gerenciador de rifa online",
};

export default function CreateAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
