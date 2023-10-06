import { IAuthenticatedUser } from "../user.type";

export type AuthContextType = {
  currentUser: IAuthenticatedUser | undefined;
  isLoggedIn: boolean;
  isLoading: boolean;
};
