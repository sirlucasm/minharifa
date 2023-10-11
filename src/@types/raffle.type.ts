/* eslint-disable no-unused-vars */

import { Timestamp } from "firebase/firestore";
import { IUser } from "./user.type";

export type IRaffleType = "number" | "contactInfo";
export type IRaffleVisibility = "public" | "private";

export interface IRaffle {
  id: string;
  name: string;
  type: IRaffleType;
  visibility: IRaffleVisibility;
  quantity?: number;
  value: string;
  shortName: string;
  userId: string;
  inviteUri: string;
  inviteCode: string;
  sharedUsers: string[];
  participants: IUser[];
  updatedAt: Timestamp;
  createdAt: Timestamp;
  deletedAt: Timestamp;
  isDeleted: boolean;
}

export interface CreateRaffleDto {
  name: string;
  type: IRaffleType;
  visibility: IRaffleVisibility;
  quantity?: string;
  value: string;
  shortName: string;
  inviteUri: string;
  inviteCode: string;
  userId: string;
}

export interface IRaffleUser {
  id: string;
  name: string;
  numbers: number[];
  raffleId: string;
  createdAt: Timestamp;
  deletedAt: Timestamp;
  isDeleted: boolean;
}

export interface CreateRaffleUserDto {
  name: string;
  numbers: {
    userNumber: number;
  }[];
  raffleId: string;
}

export interface IRaffleInvite {
  id: string;
  accepted: boolean;
  raffleId: string;
  userId: string;
  user: IUser;
  createdAt: Timestamp;
  acceptedAt: Timestamp;
  isCanceled: boolean;
  canceledAt: Timestamp;
}
