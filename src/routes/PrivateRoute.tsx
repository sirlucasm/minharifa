"use client";

import { PageLoader } from "@/components/PageLoader";
import useAuth from "@/hooks/useAuth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const verifyPublicRouter = (path: string) => {
  if (typeof window === "undefined") return;

  return window.location.pathname.includes(path);
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn || verifyPublicRouter("convidados/confirmar-presenca"))
    return <>{children}</>;

  return <PageLoader />;
};

export default PrivateRoute;
