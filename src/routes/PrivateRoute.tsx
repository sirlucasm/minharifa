"use client";

import { useEffect } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";

import routes from ".";
import checkIsPublicRoute from "@/utils/checkIsPublicRoute";
import { PageLoader } from "@/components/PageLoader";
import useAuth from "@/hooks/useAuth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const pathName = usePathname();
  const isPublicRoute = checkIsPublicRoute(pathName);
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      if (
        pathName === routes.public.login ||
        pathName === routes.public.register
      ) {
        router.replace(routes.private.home);
      }
    }
  }, [isPublicRoute, isLoggedIn, pathName, router]);

  if (!isLoggedIn) {
    if (isPublicRoute) {
      return <>{children}</>;
    }
  }

  if (isLoading) {
    if (!isPublicRoute) {
      return <>{children}</>;
    }
  }

  if (!isLoggedIn && !isPublicRoute) {
    redirect(`${routes.public.login}?r=${pathName}`);
  }

  // if (
  //   (isPublicRoute && !isLoggedIn) ||
  //   (!isPublicRoute && isLoggedIn && !isLoading)
  // ) {
  //   return <>{children}</>;
  // }

  // if (isLoggedIn) {
  //   if (isPublicRoute) {
  //     return <>{children}</>;
  //   }
  // } else {
  //   if (!isPublicRoute && !isLoading) {
  //     redirect(`${routes.public.login}?r=${pathName}`);
  //   }
  // }

  return <PageLoader />;
};

export default PrivateRoute;
