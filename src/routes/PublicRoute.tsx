"use client";

import { redirect } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import routes from ".";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    redirect(routes.private.home);
  }

  return <>{children}</>;
};

export default PublicRoute;
