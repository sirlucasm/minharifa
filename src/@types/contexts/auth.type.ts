import { AuthenticatedUserType } from "../user.type";

export type AuthContextType = {
  currentUser: AuthenticatedUserType | undefined;
  isLoggedIn: boolean;
  isLoading: boolean;
};
