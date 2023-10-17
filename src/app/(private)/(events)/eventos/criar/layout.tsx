import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar Evento - Minha Rifa",
};

export default function CreateEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
