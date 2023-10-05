import { DrawerManagerProvider } from "@/contexts/drawerManager";
import PrivateRoute from "@/routes/PrivateRoute";

export default function PrivateRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DrawerManagerProvider>
      <PrivateRoute>{children}</PrivateRoute>
    </DrawerManagerProvider>
  );
}
