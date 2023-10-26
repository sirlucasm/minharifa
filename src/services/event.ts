import { db, storage } from "@/configs/firebase";

import {
  DocumentData,
  and,
  collection,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { generateInviteCode } from "@/utils/invitation";
import { convertCurrencyToNumber } from "@/utils/currency";

import {
  CreateEventBudgetDto,
  CreateEventDto,
  CreateEventGuestDto,
  CreateEventGuestGroupDto,
  IEvent,
  IEventGuest,
  UpdateEventBudgetDto,
} from "@/@types/event.type";
import { ERRORS } from "@/constants";
import { IUser } from "@/@types/user.type";
import QRCode from "qrcode";
import routes from "@/routes";

const eventRef = collection(db, "events");
// const eventUsersRef = collection(db, "eventUsers");
// const eventInvitationsRef = collection(db, "eventInvitations");
const eventGuestsRef = collection(db, "eventGuests");
const eventGuestGroupsRef = collection(db, "eventGuestGroups");
const eventBudgetsRef = collection(db, "eventBudgets");

class EventService {
  create = async (data: CreateEventDto) => {
    const q = query(
      eventRef,
      where("shortName", "==", data.shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) throw ERRORS.event.shortNameExists;

    const eventDoc = doc(eventRef);
    const inviteCode = generateInviteCode(12);

    await setDoc(eventDoc, {
      ...data,
      budgetValue: convertCurrencyToNumber(
        data.budgetValue as unknown as string
      ),
      id: eventDoc.id,
      createdAt: new Date(),
      isDeleted: false,
      inviteUri: `${process.env.NEXT_PUBLIC_APP_URL}/rifas/${data.shortName}?cinvitation=${inviteCode}`,
      inviteCode,
    });
  };

  list = async (userId: string) => {
    const q = query(
      eventRef,
      and(
        or(
          where("sharedUsers", "array-contains", userId),
          where("userId", "==", userId)
        ),
        where("isDeleted", "==", false)
      )
    );

    const querySnapshot = await getDocs(q);

    const events: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      events.push(doc.data());
    });

    return events as IEvent[];
  };

  get = async (shortName: string, userId: string) => {
    const q = query(
      eventRef,
      and(
        or(
          where("sharedUsers", "array-contains", userId),
          where("userId", "==", userId)
        ),
        where("shortName", "==", shortName),
        where("isDeleted", "==", false)
      )
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.event.notFound;

    const event = querySnapshot.docs[0].data() as IEvent;

    const participants: IUser[] = [];

    if (event.sharedUsers) {
      event.sharedUsers.forEach(async (userId) => {
        const users = await getDoc(doc(db, "users", userId));
        participants.push(users.data() as IUser);
      });
    }

    event.participants = participants;

    return event;
  };

  getByShortName = async (shortName: string) => {
    const q = query(
      eventRef,
      where("shortName", "==", shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.event.notFound;

    const event = querySnapshot.docs[0].data();

    return event as IEvent;
  };

  delete = async (eventId: string) => {
    const raffleDoc = doc(eventRef, eventId);

    await updateDoc(raffleDoc, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  };

  createEventBudget = async (data: CreateEventBudgetDto) => {
    const eventBudgetDoc = doc(eventBudgetsRef);

    await setDoc(eventBudgetDoc, {
      ...data,
      id: eventBudgetDoc.id,
      value: convertCurrencyToNumber(data.value as unknown as string),
      createdAt: new Date(),
      isDeleted: false,
    });
  };

  updateEventBudget = async (budgetId: string, data: UpdateEventBudgetDto) => {
    const q = query(
      eventBudgetsRef,
      where("id", "==", budgetId),
      where("eventId", "==", data.eventId),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.eventBudget.notFound;

    const eventBudgetDoc = querySnapshot.docs[0].ref;

    await updateDoc(eventBudgetDoc, {
      ...data,
      value: convertCurrencyToNumber(data.value as unknown as string),
      updatedAt: new Date(),
    });
  };

  addEventGuest = async (eventShortName: string, data: CreateEventGuestDto) => {
    const eventGuestDoc = doc(eventGuestsRef);
    const eventGuestQRCodesStorageRef = ref(
      storage,
      `eventGuest/${eventGuestDoc.id}`
    );
    const eventAdminQRRedirectPage = `${
      process.env.NEXT_PUBLIC_APP_URL
    }${routes.private.eventGuests.readedQRCode(
      eventShortName,
      data.eventId,
      eventGuestDoc.id
    )}`;

    const dataUrl = await QRCode.toDataURL(eventAdminQRRedirectPage, {
      margin: 1,
      color: {
        dark: "09647d",
      },
    });

    const blob = await (await fetch(dataUrl)).blob();

    await uploadBytes(eventGuestQRCodesStorageRef, blob);

    const qrCodeImageUrl = await getDownloadURL(eventGuestQRCodesStorageRef);

    await setDoc(eventGuestDoc, {
      ...data,
      id: eventGuestDoc.id,
      createdAt: new Date(),
      isDeleted: false,
      isPresentInTheEvent: false,
      isPresenceConfirmed: false,
      qrCodeImageUrl,
    } as CreateEventGuestDto);
  };

  removeEventGuest = async (eventGuestId: string) => {
    const eventGuestDoc = doc(eventGuestsRef, eventGuestId);

    await updateDoc(eventGuestDoc, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  };

  getEventGuest = async (eventGuestId: string) => {
    const q = query(
      eventGuestsRef,
      where("id", "==", eventGuestId),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.eventGuest.notFound;

    return querySnapshot.docs[0].data() as IEventGuest;
  };

  createEventGuestGroup = async (data: CreateEventGuestGroupDto) => {
    const eventGuestGroupDoc = doc(eventGuestGroupsRef);

    await setDoc(eventGuestGroupDoc, {
      ...data,
      id: eventGuestGroupDoc.id,
      createdAt: new Date(),
      isDeleted: false,
    } as unknown as CreateEventGuestGroupDto);
  };

  removeEventGuestGroup = async (eventGuestGroupId: string) => {
    const eventGuestGroupDoc = doc(eventGuestGroupsRef, eventGuestGroupId);

    await updateDoc(eventGuestGroupDoc, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  };
}

const eventService = new EventService();
export default eventService;
