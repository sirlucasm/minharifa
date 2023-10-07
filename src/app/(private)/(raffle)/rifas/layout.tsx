import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listar Rifas - Minha Rifa",
};

export default function RaffleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
