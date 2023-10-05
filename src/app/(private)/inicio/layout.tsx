import type { Metadata } from "next";

import { DrawerManagerProvider } from "@/contexts/drawerManager";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Minha Rifa - Inicio",
};

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DrawerManagerProvider>
      <main className="flex min-h-screen flex-col">
        <AppHeader />
        {children}
      </main>
    </DrawerManagerProvider>
  );
};

export default HomeLayout;
