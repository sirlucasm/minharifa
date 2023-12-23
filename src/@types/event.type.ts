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
  settings: {
    qrCodeColors: {
      light: string;
      dark: string;
    };
  };
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
  settings: {
    qrCodeColors: {
      light: string;
      dark: string;
    };
  };
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
  isCompleted: boolean;
}

export interface CreateEventBudgetDto {
  name: string;
  value: number;
  userId: string;
  eventId: string;
  isDeleted: boolean;
  isCompleted: boolean;
}

export interface IEventGuest {
  id: string;
  name: string;
  email?: string;
  cellPhone?: string;
  eventId: string;
  isPresentInTheEvent: boolean;
  isPresenceConfirmed: boolean;
  qrCodeImageUrl: string;
  qrCodeColors: {
    dark: string;
    light: string;
  };
  isNonPaying: boolean;
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
  isNonPaying: boolean;
  isDeleted: boolean;
  qrCodeImageUrl: string;
  qrCodeColors: {
    dark: string;
    light: string;
  };
}

export interface IEventGuestGroup {
  id: string;
  name: string;
  guestIds: string[];
  guests: IEventGuest[];
  eventId: string;
  isFamily: boolean;
  qrCodeImageUrl: string;
  qrCodeColors: {
    dark: string;
    light: string;
  };
  createdAt: Timestamp;
  isDeleted: boolean;
}

export interface CreateEventGuestGroupDto
  extends Omit<Omit<IEventGuestGroup, "id">, "guests"> {}

export interface IEventInvite {
  id: string;
  accepted: boolean;
  eventId: string;
  userId: string;
  user: IUser;
  createdAt: Timestamp;
  acceptedAt: Timestamp;
  isCanceled: boolean;
  canceledAt: Timestamp;
}
