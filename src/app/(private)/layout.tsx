import AppHeader from "@/components/AppHeader";
import { DrawerManagerProvider } from "@/contexts/drawerManager";
import PrivateRoute from "@/routes/PrivateRoute";

export default function PrivateRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DrawerManagerProvider>
      <AppHeader />
      <PrivateRoute>{children}</PrivateRoute>
    </DrawerManagerProvider>
  );
}
