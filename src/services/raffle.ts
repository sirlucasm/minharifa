import {
  CreateRaffleDto,
  CreateRaffleUserDto,
  IRaffle,
  IRaffleInvite,
  UpdateRaffleDto,
  UpdateRaffleUserDto,
} from "@/@types/raffle.type";
import { IUser } from "@/@types/user.type";
import { db } from "@/configs/firebase";
import { ERRORS } from "@/constants";
import { generateInviteCode } from "@/utils/raffle";
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

const rafflesRef = collection(db, "raffles");
const raffleUsersRef = collection(db, "raffleUsers");
const raffleInvitesRef = collection(db, "raffleInvites");

class RaffleService {
  createRaffle = async (data: CreateRaffleDto) => {
    const q = query(
      rafflesRef,
      where("shortName", "==", data.shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) throw ERRORS.raffleShortNameExists;

    const raffleDoc = doc(rafflesRef);
    const inviteCode = generateInviteCode(12);

    await setDoc(raffleDoc, {
      ...data,
      id: raffleDoc.id,
      createdAt: new Date(),
      isDeleted: false,
      inviteUri: `${process.env.NEXT_PUBLIC_APP_URL}/rifas/${data.shortName}?cinvitation=${inviteCode}`,
      inviteCode,
    });
  };

  updateRaffle = async (data: UpdateRaffleDto) => {
    const q = query(
      rafflesRef,
      where("shortName", "==", data.shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.raffleNotFound;

    const raffleDoc = querySnapshot.docs[0].ref;
    const inviteCode = generateInviteCode(12);

    await updateDoc(raffleDoc, {
      ...data,
      updatedAt: new Date(),
      inviteUri: `${process.env.NEXT_PUBLIC_APP_URL}/rifas/${data.shortName}?cinvitation=${inviteCode}`,
      inviteCode,
    });
  };

  deleteRaffle = async (raffleId: string) => {
    const raffleDoc = doc(rafflesRef, raffleId);

    await updateDoc(raffleDoc, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  };

  listRaffle = async (userId: string) => {
    const q = query(
      rafflesRef,
      and(
        or(
          where("sharedUsers", "array-contains", userId),
          where("userId", "==", userId)
        ),
        where("isDeleted", "==", false)
      )
    );

    const querySnapshot = await getDocs(q);

    const raffles: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      raffles.push(doc.data());
    });

    return raffles as IRaffle[];
  };

  getRaffle = async (shortName: string, userId: string) => {
    const q = query(
      rafflesRef,
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

    if (querySnapshot.empty) throw ERRORS.raffleNotFound;

    const raffle = querySnapshot.docs[0].data() as IRaffle;

    const participants: IUser[] = [];

    if (raffle.sharedUsers) {
      raffle.sharedUsers.forEach(async (userId) => {
        const users = await getDoc(doc(db, "users", userId));
        participants.push(users.data() as IUser);
      });
    }

    raffle.participants = participants;

    return raffle;
  };

  getRaffleByShortName = async (shortName: string) => {
    const q = query(
      rafflesRef,
      where("shortName", "==", shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.raffleNotFound;

    const raffle = querySnapshot.docs[0].data();

    return raffle as IRaffle;
  };

  getOwnerUserAndRaffleByRaffleShortName = async (shortName: string) => {
    const q = query(
      rafflesRef,
      where("shortName", "==", shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw ERRORS.raffleNotFound;

    const raffle = querySnapshot.docs[0].data() as IRaffle;

    const userRef = doc(db, "users", raffle.userId);
    const userDoc = await getDoc(userRef);
    const user = userDoc.data() as IUser;

    return { raffle, user };
  };

  createRaffleUser = async (data: CreateRaffleUserDto) => {
    const numbersFormatted = data.numbers.map((number) => number.userNumber);

    const q = query(
      raffleUsersRef,
      where("numbers", "array-contains-any", numbersFormatted),
      where("raffleId", "==", data.raffleId),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) throw ERRORS.raffleUserNumberAlreadyUsed;

    const raffleUserDoc = doc(raffleUsersRef);

    await setDoc(raffleUserDoc, {
      ...data,
      numbers: numbersFormatted,
      id: raffleUserDoc.id,
      createdAt: new Date(),
      raffleId: data.raffleId,
      isDeleted: false,
    });
  };

  updateRaffleUser = async (raffleId: string, data: UpdateRaffleUserDto) => {
    const splittedNumbers = data.numbers ? data.numbers.split(",") : [];
    const numbersFormatted = splittedNumbers.map((number) => Number(number));

    const q = query(
      raffleUsersRef,
      where("numbers", "array-contains-any", numbersFormatted),
      where("raffleId", "==", raffleId),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 1) throw ERRORS.raffleUserNumberAlreadyUsed;

    if (!querySnapshot.empty) {
      const raffleUsersDoc = querySnapshot.docs[0].ref;
      await updateDoc(raffleUsersDoc, {
        name: data.name,
        numbers: numbersFormatted,
        updatedAt: new Date(),
      });
    }
  };

  sendInviteRequest = async (raffleId: string, invitedUserId: string) => {
    const q = query(
      raffleInvitesRef,
      where("raffleId", "==", raffleId),
      where("invitedUserId", "==", invitedUserId),
      where("isCanceled", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) throw ERRORS.raffleInviteAlreadySent;

    const raffleInviteDoc = doc(raffleInvitesRef);

    await setDoc(raffleInviteDoc, {
      id: raffleInviteDoc.id,
      createdAt: new Date(),
      raffleId,
      accepted: false,
      userId: invitedUserId,
      isCanceled: false,
    });
  };

  getInviteRequestsAndUser = async (raffleId: string) => {
    const q = query(
      raffleInvitesRef,
      where("raffleId", "==", raffleId),
      where("isCanceled", "==", false),
      where("accepted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    const invites: DocumentData[] = [];
    querySnapshot.forEach(async (response) => {
      const data = response.data();
      const user = await getDoc(doc(db, "users", data.userId));
      data.user = user.data();
      invites.push(data);
    });

    return invites as IRaffleInvite[];
  };

  acceptRaffleInviteRequest = async ({
    raffleId,
    inviteId,
    invitatedUserId,
  }: {
    invitatedUserId: string;
    inviteId: string;
    raffleId: string;
  }) => {
    const raffleInviteDoc = doc(raffleInvitesRef, inviteId);
    const raffleDoc = doc(rafflesRef, raffleId);

    await updateDoc(raffleInviteDoc, {
      accepted: true,
      acceptedAt: new Date(),
    });

    await updateDoc(raffleDoc, {
      sharedUsers: arrayUnion(invitatedUserId),
      updatedAt: new Date(),
    });
  };

  cancelRaffleInviteRequest = async (inviteId: string) => {
    const raffleInviteDoc = doc(raffleInvitesRef, inviteId);

    await updateDoc(raffleInviteDoc, {
      isCanceled: true,
      canceledAt: new Date(),
    });
  };
}

const raffleService = new RaffleService();
export default raffleService;
