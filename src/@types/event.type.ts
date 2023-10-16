import { Timestamp } from "firebase/firestore";
import { IUser } from "./user.type";

export type IEventVisibility = "public" | "private";

export interface IEvent {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  budgetValue: number;
  visibility: IEventVisibility;
  userId: string;
  inviteUri: string;
  inviteCode: string;
  startAt: Timestamp;
  endAt: Timestamp;
  sharedUsers: string[];
  participants: IUser[];
  updatedAt: Timestamp;
  createdAt: Timestamp;
  deletedAt: Timestamp;
  isDeleted: boolean;
}

export interface CreateEventDto {
  name: string;
  description?: string;
  shortName: string;
  visibility: IEventVisibility;
  budgetValue: number;
  inviteUri: string;
  inviteCode: string;
  userId: string;
  isDeleted: boolean;
  startAt: Timestamp;
  endAt: Timestamp;
}
