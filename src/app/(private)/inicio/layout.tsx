import type { Metadata } from "next";

import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Minha Rifa - Inicio",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
