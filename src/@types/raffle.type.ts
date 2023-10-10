/* eslint-disable no-unused-vars */

import { Timestamp } from "firebase/firestore";

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
}

export interface IRaffleUser {
  id: string;
  name: string;
  numbers: number[];
  userId: string;
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
  userId: string;
  raffleId: string;
}
