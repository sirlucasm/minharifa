/* eslint-disable no-unused-vars */

import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export type IUser = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  profileImageUrl?: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  deletedAt: Timestamp;
  isDeleted: boolean;
  verifiedUserEmailAt: Timestamp;
  lastLoginAt: Timestamp;
};

export type IAuthenticatedUser = User & IUser;

export interface LoginUserDto {
  emailOrUsername: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  username: string;
}
