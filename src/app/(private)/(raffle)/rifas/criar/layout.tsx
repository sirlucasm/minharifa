import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar Rifa - Minha Rifa",
};

export default function CreateRaffleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
