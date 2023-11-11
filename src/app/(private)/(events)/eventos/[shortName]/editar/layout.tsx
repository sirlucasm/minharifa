import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Evento - Minha Rifa",
};

export default function EditEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
