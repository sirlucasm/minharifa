import { db, storage } from "@/configs/firebase";

import {
  DocumentData,
  and,
  arrayUnion,
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
  IEventGuestGroup,
} from "@/@types/event.type";
import { ERRORS } from "@/constants";
import { IUser } from "@/@types/user.type";
import QRCode from "qrcode";
import routes from "@/routes";

const eventRef = collection(db, "events");
// const eventUsersRef = collection(db, "eventUsers");
const eventInvitationsRef = collection(db, "eventInvitations");
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
      inviteUri: `${process.env.NEXT_PUBLIC_APP_URL}/eventos/${data.shortName}?cinvitation=${inviteCode}`,
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

  isEventUserOwner = async (shortName: string, userId: string) => {
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

    if (querySnapshot.empty) return false;

    return true;
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
    const eventDoc = doc(eventRef, eventId);

    await updateDoc(eventDoc, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  };

  getOwnerUserAndEventByEventShortName = async (shortName: string) => {
    const q = query(
      eventRef,
      where("shortName", "==", shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.event.notFound;

    const event = querySnapshot.docs[0].data() as IEvent;

    const userRef = doc(db, "users", event.userId);
    const userDoc = await getDoc(userRef);
    const user = userDoc.data() as IUser;

    return { event, user };
  };

  sendInviteRequest = async (eventId: string, invitedUserId: string) => {
    const q = query(
      eventInvitationsRef,
      where("eventId", "==", eventId),
      where("invitedUserId", "==", invitedUserId),
      where("isCanceled", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) throw ERRORS.event.inviteAlreadySent;

    const eventInviteDoc = doc(eventInvitationsRef);

    await setDoc(eventInviteDoc, {
      id: eventInviteDoc.id,
      createdAt: new Date(),
      eventId,
      accepted: false,
      userId: invitedUserId,
      isCanceled: false,
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
      isCompleted: false,
    });
  };

  updateEventBudget = async (
    budgetId: string,
    data: Partial<CreateEventBudgetDto>
  ) => {
    const q = query(
      eventBudgetsRef,
      where("id", "==", budgetId),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.eventBudget.notFound;

    const eventBudgetDoc = querySnapshot.docs[0].ref;

    if (data.value) {
      data.value = convertCurrencyToNumber(data.value as unknown as string);
    }

    await updateDoc(eventBudgetDoc, {
      ...data,
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
    }${routes.public.eventGuests.shareQRCode(
      eventShortName,
      data.eventId,
      eventGuestDoc.id
    )}`;

    const dataUrl = await QRCode.toDataURL(eventAdminQRRedirectPage, {
      margin: 1,
      color: data.qrCodeColors,
      width: 512,
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

  updateEventGuest = async (
    eventGuestId: string,
    data: Partial<CreateEventGuestDto>
  ) => {
    const eventGuestDoc = doc(eventGuestsRef, eventGuestId);

    await updateDoc(eventGuestDoc, data);
  };

  createEventGuestGroup = async (
    eventShortName: string,
    data: CreateEventGuestGroupDto
  ) => {
    const eventGuestGroupDoc = doc(eventGuestGroupsRef);
    const eventGuestGroupQRCodesStorageRef = ref(
      storage,
      `eventGuestGroup/${eventGuestGroupDoc.id}`
    );
    const eventAdminQRRedirectPage = `${
      process.env.NEXT_PUBLIC_APP_URL
    }${routes.public.eventGuests.shareQRCode(
      eventShortName,
      data.eventId,
      eventGuestGroupDoc.id
    )}`;

    const dataUrl = await QRCode.toDataURL(eventAdminQRRedirectPage, {
      margin: 1,
      color: data.qrCodeColors,
      width: 512,
    });

    const blob = await (await fetch(dataUrl)).blob();

    await uploadBytes(eventGuestGroupQRCodesStorageRef, blob);

    const qrCodeImageUrl = await getDownloadURL(
      eventGuestGroupQRCodesStorageRef
    );

    await setDoc(eventGuestGroupDoc, {
      ...data,
      id: eventGuestGroupDoc.id,
      createdAt: new Date(),
      isDeleted: false,
      qrCodeImageUrl,
    } as unknown as CreateEventGuestGroupDto);
  };

  removeEventGuestGroup = async (eventGuestGroupId: string) => {
    const eventGuestGroupDoc = doc(eventGuestGroupsRef, eventGuestGroupId);

    await updateDoc(eventGuestGroupDoc, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  };

  getEventGuestGroup = async (eventGuestGroupId: string) => {
    const q = query(
      eventGuestGroupsRef,
      where("id", "==", eventGuestGroupId),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.eventGuest.notFound;

    const guestGroup = querySnapshot.docs[0].data() as IEventGuestGroup;

    const guestQuery = query(
      eventGuestsRef,
      where("id", "in", guestGroup.guestIds),
      where("isDeleted", "==", false)
    );

    const guestQuerySnapshot = await getDocs(guestQuery);

    const guests: IEventGuest[] = [];

    guestQuerySnapshot.forEach(async (snapshot) =>
      guests.push(snapshot.data() as IEventGuest)
    );

    guestGroup.guests = guests;

    return guestGroup;
  };

  updateEventGuestGroup = async (
    eventGuestGroupId: string,
    data: Partial<CreateEventGuestGroupDto>
  ) => {
    const eventGuestGroupDoc = doc(eventGuestGroupsRef, eventGuestGroupId);

    await updateDoc(eventGuestGroupDoc, data);
  };

  acceptEventInviteRequest = async ({
    eventId,
    inviteId,
    invitatedUserId,
  }: {
    invitatedUserId: string;
    inviteId: string;
    eventId: string;
  }) => {
    const eventInvitationsDoc = doc(eventInvitationsRef, inviteId);
    const eventDoc = doc(eventRef, eventId);

    await updateDoc(eventInvitationsDoc, {
      accepted: true,
      acceptedAt: new Date(),
    });

    await updateDoc(eventDoc, {
      sharedUsers: arrayUnion(invitatedUserId),
      updatedAt: new Date(),
    });
  };

  cancelEventInviteRequest = async (inviteId: string) => {
    const eventInvitationsDoc = doc(eventInvitationsRef, inviteId);

    await updateDoc(eventInvitationsDoc, {
      isCanceled: true,
      canceledAt: new Date(),
    });
  };
}

const eventService = new EventService();
export default eventService;
