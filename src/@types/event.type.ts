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

export interface IEventBudget {
  id: string;
  name: string;
  value: number;
  userId: string;
  eventId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp;
  isDeleted: boolean;
}

export interface CreateEventBudgetDto {
  name: string;
  value: number;
  userId: string;
  eventId: string;
  isDeleted: boolean;
}

export interface UpdateEventBudgetDto {
  name?: string;
  value?: number;
  userId: string;
  eventId: string;
}

export interface IEventGuest {
  id: string;
  name: string;
  email?: string;
  cellPhone?: string;
  eventId: string;
  isPresentInTheEvent: boolean;
  isPresenceConfirmed: boolean;
  createdAt: Timestamp;
  deletedAt: Timestamp;
  isDeleted: boolean;
}

export interface CreateEventGuestDto {
  name: string;
  email?: string;
  cellPhone?: string;
  eventId: string;
  isPresentInTheEvent: boolean;
  isPresenceConfirmed: boolean;
  isDeleted: boolean;
}

export interface IEventGuestGroup {
  id: string;
  name: string;
  guests: string[];
  eventId: string;
  isFamily: boolean;
  qrCodeImageUrl?: string;
  createdAt: Timestamp;
  isDeleted: boolean;
}

export interface CreateEventGuestGroupDto
  extends Omit<IEventGuestGroup, "id"> {}
