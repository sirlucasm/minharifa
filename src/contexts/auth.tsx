"use client";

import { createContext, useState, useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/configs/firebase";
import authService from "@/services/auth";
import { AuthContextType } from "@/@types/contexts/auth.type";
import { IAuthenticatedUser } from "@/@types/user.type";
import { useRouter } from "next/navigation";
import routes from "@/routes";

const AuthContext = createContext({
  currentUser: undefined,
  isLoggedIn: false,
  isLoading: true,
} as AuthContextType);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<
    IAuthenticatedUser | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, async (fetchedCurrentUser) => {
      if (fetchedCurrentUser) {
        const { user } = await authService.getUser(
          fetchedCurrentUser.email as string
        );

        setIsLoading(false);
        if (!user) {
          router.replace(routes.public.login);
          return;
        }
        setCurrentUser(Object.assign(user, fetchedCurrentUser));
        return;
      }
      if (window.location.pathname.includes("convidados/confirmar-presenca")) {
        return;
      }
      router.replace(routes.public.login);
      setCurrentUser(undefined);
      setIsLoading(false);
    });
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;
