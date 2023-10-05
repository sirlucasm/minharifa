import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Rifa - Inicio",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
