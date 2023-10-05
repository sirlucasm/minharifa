"use client";

import { PageLoader } from "@/components/PageLoader";
import useAuth from "@/hooks/useAuth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) return <>{children}</>;

  return <PageLoader />;
};

export default PrivateRoute;
