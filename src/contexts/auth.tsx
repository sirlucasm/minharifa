"use client";

import { createContext, useState, useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/configs/firebase";
import authService from "@/services/auth";
import { AuthContextType } from "@/@types/contexts/auth.type";
import { AuthenticatedUserType } from "@/@types/user.type";

const AuthContext = createContext({
  currentUser: undefined,
  isLoggedIn: false,
  isLoading: true,
} as AuthContextType);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<
    AuthenticatedUserType | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, async (fetchedCurrentUser) => {
      if (fetchedCurrentUser) {
        const { user } = await authService.getUser(
          fetchedCurrentUser.email as string
        );

        setIsLoading(false);
        if (!user) return;
        setCurrentUser(Object.assign(user, fetchedCurrentUser));
        return;
      }
      setCurrentUser(undefined);
      setIsLoading(false);
    });
  }, []);

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
