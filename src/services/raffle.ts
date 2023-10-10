import {
  CreateRaffleDto,
  CreateRaffleUserDto,
  IRaffle,
} from "@/@types/raffle.type";
import { db } from "@/configs/firebase";
import { ERRORS } from "@/constants";
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

const rafflesRef = collection(db, "raffles");
const raffleUsersRef = collection(db, "raffleUsers");

class RaffleService {
  createRaffle = async (userId: string, data: CreateRaffleDto) => {
    const q = query(
      rafflesRef,
      where("shortName", "==", data.shortName),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) throw ERRORS.raffleShortNameExists;

    const raffleDoc = doc(rafflesRef);

    await setDoc(raffleDoc, {
      ...data,
      quantity: parseInt(data.quantity as string),
      id: raffleDoc.id,
      createdAt: new Date(),
      userId,
      isDeleted: false,
    });
  };

  listRaffle = async (userId: string) => {
    const q = query(
      rafflesRef,
      where("userId", "==", userId),
      where("isDeleted", "==", false)
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

    const raffle = querySnapshot.docs[0].data();

    return raffle as IRaffle;
  };

  createRaffleUser = async (data: CreateRaffleUserDto) => {
    const numbersFormatted = data.numbers.map((number) => number.userNumber);

    const q = query(
      raffleUsersRef,
      where("numbers", "array-contains-any", numbersFormatted),
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
      userId: data.userId,
      raffleId: data.raffleId,
      isDeleted: false,
    });
  };
}

const raffleService = new RaffleService();
export default raffleService;
