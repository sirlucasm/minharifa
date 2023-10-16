import { db } from "@/configs/firebase";

import {
  DocumentData,
  and,
  collection,
  doc,
  getDocs,
  or,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { generateInviteCode } from "@/utils/invitation";
import { convertCurrencyToNumber } from "@/utils/currency";

import { CreateEventDto, IEvent } from "@/@types/event.type";
import { ERRORS } from "@/constants";

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
        where("isDeleted", "==", false),
        where("startAt", "<=", new Date())
      )
    );

    const querySnapshot = await getDocs(q);

    const events: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      events.push(doc.data());
    });

    return events as IEvent[];
  };
}

const eventService = new EventService();
export default eventService;
