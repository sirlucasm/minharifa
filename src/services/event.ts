import { db } from "@/configs/firebase";

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
import { generateInviteCode } from "@/utils/invitation";
import { convertCurrencyToNumber } from "@/utils/currency";

import { CreateEventDto, IEvent } from "@/@types/event.type";
import { ERRORS } from "@/constants";
import { IUser } from "@/@types/user.type";

const eventRef = collection(db, "events");
// const eventUsersRef = collection(db, "eventUsers");
// const eventInvitationsRef = collection(db, "eventInvitations");

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
}

const eventService = new EventService();
export default eventService;
