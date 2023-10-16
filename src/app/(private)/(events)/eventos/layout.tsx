import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listar Eventos - Minha Rifa",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
