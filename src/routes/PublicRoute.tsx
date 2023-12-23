"use client";

import { redirect, usePathname } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import routes from ".";

interface PublicRouteProps {
  children: React.ReactNode;
}

const canAccessPage = (pathToVerify: string, currentPath: string) => {
  if (typeof window === "undefined") return;

  return currentPath.includes(pathToVerify);
};

const PublicRoute = ({ children }: PublicRouteProps) => {
  const pathName = usePathname();
  const { isLoggedIn } = useAuth();

  if (canAccessPage("convidados/confirmar-presenca", pathName)) {
    return <>{children}</>;
  }

  if (isLoggedIn) {
    redirect(routes.private.home);
  }

  return <>{children}</>;
};

export default PublicRoute;
